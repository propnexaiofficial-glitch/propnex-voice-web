import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "propnex_secret_jwt_key_2026_key";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.sub || decoded.id;

    const member = await (prisma as any).companyMember.findFirst({
      where: { userId, status: "ACTIVE" }
    });

    if (!member?.companyId) {
      return NextResponse.json({ data: [] });
    }

    const companyId = member.companyId;

    // Fetch all initial FAILED/MISSED calls to find the base "Failed Leads" pool
    // We only want original outbound calls, NOT reactivation calls
    const failedCalls = await prisma.callLog.findMany({
      where: {
        companyId,
        direction: "OUTBOUND",
        OR: [
          { status: { in: ["FAILED", "MISSED", "BUSY", "NO_ANSWER", "CANCELLED"] } },
          { durationSeconds: 0 },
        ],
        leadId: { not: null },
        correlationId: null, // Reactivation calls now have correlationId set to reactivation-xxx-qX
      },
      include: {
        lead: true,
        phoneNumber: true,
      },
      orderBy: {
        startedAt: "desc"
      }
    });

    // Also fetch all reactivation CallLogs to track Q1/Q2/Q3 progress
    // We need these to know if a lead successfully answered during Q1, Q2, or Q3
    const reactivationLogs = await prisma.callLog.findMany({
      where: {
        companyId,
        direction: "OUTBOUND",
        correlationId: { startsWith: "reactivation-" }
      },
      select: {
        leadId: true,
        status: true,
        correlationId: true,
        durationSeconds: true
      }
    });

    const activeCampaignIds = new Set<string>();
    reactivationLogs.forEach(log => {
      if (log.status === "PENDING" || log.status === "RINGING") {
        if (log.correlationId) activeCampaignIds.add(log.correlationId);
      }
    });

    // Group by Date ONLY (YYYY-MM-DD)
    const buckets: Record<string, any> = {};

    for (const call of failedCalls) {
      if (!call.lead) continue;
      
      const d = new Date(call.startedAt);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const key = dateStr;
      
      if (!buckets[key]) {
        const nextDay = new Date(d);
        nextDay.setDate(d.getDate() + 1);
        nextDay.setHours(0, 0, 0, 0);

        const shortFmt = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" }).format(d); // e.g. "12 Sep"
        const nextShortFmt = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" }).format(nextDay); // e.g. "13 Sep"
        
        const q1Time = new Date(nextDay); q1Time.setHours(10, 0, 0, 0);
        const q2Time = new Date(nextDay); q2Time.setHours(14, 0, 0, 0);
        const q3Time = new Date(nextDay); q3Time.setHours(20, 0, 0, 0);

        buckets[key] = {
          id: key,
          csvName: `${shortFmt} Failed Leads`,
          didNumber: call.phoneNumber?.number || "Unknown",
          channels: call.phoneNumber?.channels || 1,
          date: shortFmt, // E.g. "12 Sep"
          originalDateMs: d.getTime(),
          q1Time, q2Time, q3Time,
          q1: { label: "Wave 1", scheduled: `${nextShortFmt} 10 Am`, status: "Pending", failedLeads: [] },
          q2: { label: "Wave 2", scheduled: `${nextShortFmt} 2 Pm`, status: "Pending", failedLeads: [] },
          q3: { label: "Wave 3", scheduled: `${nextShortFmt} 8 Pm`, status: "Pending", failedLeads: [] },
        };
      } else {
        if (call.phoneNumber?.number && buckets[key].didNumber !== call.phoneNumber.number) {
           buckets[key].didNumber = "Multiple Numbers";
        }
      }
      
      const leadId = call.leadId;
      const leadPhone = call.lead.phone;
      if (!buckets[key].q1.failedLeads.find((l: any) => l.phone === leadPhone)) {
        
        let leadName = "Unknown";
        if (call.lead.firstName || call.lead.lastName) {
           leadName = `${call.lead.firstName || ""} ${call.lead.lastName || ""}`.trim();
        } else if ((call.lead as any).name) {
           leadName = (call.lead as any).name;
        } else if (call.lead.customFields) {
           try {
             const custom = typeof call.lead.customFields === 'string' ? JSON.parse(call.lead.customFields) : call.lead.customFields;
             if (custom.Name || custom.name) leadName = custom.Name || custom.name;
           } catch(e) {}
        }

        buckets[key].q1.failedLeads.push({
           id: leadId,
           name: leadName,
           phone: call.lead.phone,
           didNumber: call.phoneNumber?.number || "Unknown",
           isCompleted: false
        });
      }
    }

    // Now refine the lists based on actual Reactivation Q1/Q2/Q3 performance
    for (const key of Object.keys(buckets)) {
      const b = buckets[key];
      const now = new Date();

      // Determine Statuses
      const q1Running = Array.from(activeCampaignIds).some(id => id.includes("-q1"));
      const q2Running = Array.from(activeCampaignIds).some(id => id.includes("-q2"));
      const q3Running = Array.from(activeCampaignIds).some(id => id.includes("-q3"));

      b.q1.status = q1Running ? "Running" : (now > b.q1Time ? "Completed" : "Pending");
      b.q2.status = q2Running ? "Running" : (now > b.q2Time ? "Completed" : "Pending");
      b.q3.status = q3Running ? "Running" : (now > b.q3Time ? "Completed" : "Pending");

      // Filter Leads across stages
      const q1FinalList = [];
      const q2FinalList = [];
      const q3FinalList = [];

      for (const lead of b.q1.failedLeads) {
         const leadLogs = reactivationLogs.filter(l => l.leadId === lead.id);
         
         const q1Log = leadLogs.find(l => l.correlationId?.endsWith("-q1"));
         const q2Log = leadLogs.find(l => l.correlationId?.endsWith("-q2"));
         const q3Log = leadLogs.find(l => l.correlationId?.endsWith("-q3"));

         let completedInQ1 = q1Log?.status === "COMPLETED" && (q1Log.durationSeconds || 0) > 0;
         let completedInQ2 = q2Log?.status === "COMPLETED" && (q2Log.durationSeconds || 0) > 0;
         let completedInQ3 = q3Log?.status === "COMPLETED" && (q3Log.durationSeconds || 0) > 0;

         // Q1 always gets the lead. Show checkmark if it completed.
         q1FinalList.push({ ...lead, isCompleted: completedInQ1 });

         // If it didn't complete in Q1, it rolls over to Q2 (assuming Q1 has already run, or it's scheduled)
         if (!completedInQ1) {
            q2FinalList.push({ ...lead, isCompleted: completedInQ2 });
            
            // If it didn't complete in Q2, it rolls over to Q3
            if (!completedInQ2) {
               q3FinalList.push({ ...lead, isCompleted: completedInQ3 });
            }
         }
      }

      b.q1.failedLeads = q1FinalList;
      b.q2.failedLeads = q2FinalList;
      b.q3.failedLeads = q3FinalList;
    }

    const data = Object.values(buckets).sort((a: any, b: any) => b.originalDateMs - a.originalDateMs);

    // Clean up internal dates before sending to client
    for (const b of data) {
      delete b.q1Time;
      delete b.q2Time;
      delete b.q3Time;
      delete b.originalDateMs;
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Failed to fetch reactivation dashboard data:", error);
    return NextResponse.json({ message: "Internal server error", data: [] }, { status: 500 });
  }
}
