import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { format, startOfDay, addDays } from "date-fns";

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
      
      const dateStr = format(call.startedAt, "yyyy-MM-dd");
      const key = `${dateStr}-${call.phoneNumber?.number || "default"}`;
      
      if (!buckets[key]) {
        const nextDay = addDays(startOfDay(call.startedAt), 1);
        buckets[key] = {
          id: key,
          csvName: `${format(call.startedAt, "dd MMM")} Failed Leads`,
          didNumber: call.phoneNumber?.number || "Unknown",
          channels: call.phoneNumber?.channels || 1,
          date: format(call.startedAt, "dd MMM yyyy"),
          q1: { 
            scheduled: format(new Date(nextDay.setHours(10, 0, 0, 0)), "dd MMM hh:mm a"), 
            status: new Date() > new Date(nextDay.setHours(10, 0, 0, 0)) ? "completed" : "pending", 
            failedLeads: [] 
          },
          q2: { 
            scheduled: format(new Date(nextDay.setHours(14, 0, 0, 0)), "dd MMM hh:mm a"), 
            status: new Date() > new Date(nextDay.setHours(14, 0, 0, 0)) ? "completed" : "pending", 
            failedLeads: [] 
          },
          q3: { 
            scheduled: format(new Date(nextDay.setHours(20, 0, 0, 0)), "dd MMM hh:mm a"), 
            status: new Date() > new Date(nextDay.setHours(20, 0, 0, 0)) ? "completed" : "pending", 
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
