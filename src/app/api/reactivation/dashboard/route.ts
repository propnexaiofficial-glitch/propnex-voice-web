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

    // Fetch all FAILED, MISSED, BUSY, NO-ANSWER, or 0s duration calls
    const failedCalls = await prisma.callLog.findMany({
      where: {
        companyId,
        direction: "OUTBOUND",
        OR: [
          { status: { in: ["FAILED", "MISSED", "BUSY", "NO_ANSWER", "CANCELLED"] } },
          { durationSeconds: 0 },
        ],
        leadId: { not: null },
      },
      include: {
        lead: true,
        phoneNumber: true,
      },
      orderBy: {
        startedAt: "desc"
      }
    });

    // Group by Date (YYYY-MM-DD)
    const buckets: Record<string, any> = {};

    for (const call of failedCalls) {
      if (!call.lead) continue;
      
      const d = new Date(call.startedAt);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const key = `${dateStr}-${call.phoneNumber?.number || "default"}`;
      
      if (!buckets[key]) {
        const nextDay = new Date(d);
        nextDay.setDate(d.getDate() + 1);
        nextDay.setHours(0, 0, 0, 0);

        const shortFmt = new Intl.DateTimeFormat("en-US", { day: "2-digit", month: "short" }).format(d);
        const longFmt = new Intl.DateTimeFormat("en-US", { day: "2-digit", month: "short", year: "numeric" }).format(d);
        
        const q1Time = new Date(nextDay);
        q1Time.setHours(10, 0, 0, 0);
        const q2Time = new Date(nextDay);
        q2Time.setHours(14, 0, 0, 0);
        const q3Time = new Date(nextDay);
        q3Time.setHours(20, 0, 0, 0);

        const timeFmt = new Intl.DateTimeFormat("en-US", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: true });

        buckets[key] = {
          id: key,
          csvName: `${shortFmt} Failed Leads`,
          didNumber: call.phoneNumber?.number || "Unknown",
          channels: call.phoneNumber?.channels || 1,
          date: longFmt,
          q1: { 
            scheduled: timeFmt.format(q1Time), 
            status: new Date() > q1Time ? "completed" : "pending", 
            failedLeads: [] 
          },
          q2: { 
            scheduled: timeFmt.format(q2Time), 
            status: new Date() > q2Time ? "completed" : "pending", 
            failedLeads: [] 
          },
          q3: { 
            scheduled: timeFmt.format(q3Time), 
            status: new Date() > q3Time ? "completed" : "pending", 
            failedLeads: [] 
          },
        };
      }
      
      // Prevent duplicates in the same bucket
      if (!buckets[key].q1.failedLeads.find((l: any) => l.id === call.leadId)) {
        buckets[key].q1.failedLeads.push(call.lead);
        // Distribute to Q2/Q3 for UI purposes (the backend prunes them if they answered)
        buckets[key].q2.failedLeads.push(call.lead);
        buckets[key].q3.failedLeads.push(call.lead);
      }
    }

    const data = Object.values(buckets);

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Failed to fetch reactivation dashboard data:", error);
    return NextResponse.json({ message: "Internal server error", data: [] }, { status: 500 });
  }
}
