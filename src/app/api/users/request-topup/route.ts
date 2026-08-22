import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "propnex_secret_jwt_key_2026_key";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    
    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.sub || decoded.id;

    const body = await req.json();
    
    if (typeof body.amount !== 'number' || body.amount < 5000) {
      return NextResponse.json({ error: "invalid_amount", message: "Minimum top-up request must be at least 5,000 credits." }, { status: 400 });
    }
    
    // Check if already pending
    const existing = await prisma.supportRequest.findFirst({
      where: { userId, reason: "BILLING_CREDITS", status: "NEW" }
    });
    
    if (existing) {
      return NextResponse.json({ error: "already_pending", message: "You already have a pending top-up request." }, { status: 409 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    // Find active company member to get companyId
    const member = await (prisma as any).companyMember.findFirst({
      where: { userId, status: "ACTIVE" }
    });

    await prisma.supportRequest.create({
      data: {
        userId,
        companyId: member?.companyId || null,
        name: user?.firstName || "User",
        email: user?.email || "Unknown",
        reason: "BILLING_CREDITS",
        message: "Requested " + (body.amount || 0) + " credits",
        status: "NEW"
      }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
