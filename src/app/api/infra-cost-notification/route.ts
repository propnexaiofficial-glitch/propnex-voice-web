import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const JWT_SECRET = process.env.JWT_SECRET || "propnex_secret_jwt_key_2026_key";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ active: false }, { status: 401 });
    }
    
    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.sub || decoded.id;

    const member = await (prisma as any).companyMember.findFirst({
      where: { userId, status: "ACTIVE" }
    });

    if (!member?.companyId) return NextResponse.json({ active: false });

    // Fetch the latest notification for this company
    const notification = await prisma.infraCostNotification.findFirst({
      where: {
        OR: [
          { companyId: member.companyId },
          { subCompanyId: member.companyId }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!notification) return NextResponse.json({ active: false });

    const now = new Date();
    
    // If paused, don't show
    if (notification.pausedUntil && new Date(notification.pausedUntil) > now) {
      return NextResponse.json({ active: false });
    }

    const startDate = new Date(notification.startDate);
    const endDate = new Date(notification.endDate);
    
    const startDay = startDate.getDate();
    const endDay = endDate.getDate();
    const currentDay = now.getDate();

    let isActiveToday = false;

    if (startDay <= endDay) {
      // Normal range: e.g. 5th to 15th
      isActiveToday = currentDay >= startDay && currentDay <= endDay;
    } else {
      // Wrapping range: e.g. 25th to 5th
      isActiveToday = currentDay >= startDay || currentDay <= endDay;
    }

    // Check Recurrence
    let isMonthMatch = false;
    const startMonth = startDate.getFullYear() * 12 + startDate.getMonth();
    const currentMonth = now.getFullYear() * 12 + now.getMonth();
    
    // Adjust currentMonth if wrapping ranges and we are in the "end" part of the wrap (next month technically)
    let effectiveMonthDiff = currentMonth - startMonth;
    if (startDay > endDay && currentDay <= endDay) {
       effectiveMonthDiff -= 1; 
    }

    if (notification.recurrenceType === "ONCE") {
       // Since the initial window is set, if now is past the absolute endDate, it's expired.
       if (now > endDate) {
          return NextResponse.json({ active: false });
       }
       isMonthMatch = true;
    } else if (notification.recurrenceType.startsWith("EVERY_")) {
       // e.g. "EVERY_1_MONTH", "EVERY_6_MONTHS"
       const parts = notification.recurrenceType.split("_");
       const interval = parseInt(parts[1]) || 1;
       isMonthMatch = effectiveMonthDiff >= 0 && effectiveMonthDiff % interval === 0;
    }

    if (isActiveToday && isMonthMatch && notification.message) {
      return NextResponse.json({ 
        active: true, 
        message: notification.message 
      });
    }

    return NextResponse.json({ active: false });
  } catch (error) {
    console.error("Infra Cost Notification Error:", error);
    return NextResponse.json({ active: false }, { status: 500 });
  }
}
