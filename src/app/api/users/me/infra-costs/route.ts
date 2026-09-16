import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "propnex_secret_jwt_key_2026_key";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const userId = decoded.sub || decoded.id;
    if (!userId) {
      return NextResponse.json({ message: "Invalid token payload" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId as string },
      select: { email: true, id: true },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    let companyId: string | null = null;
    try {
      const member = await (prisma as any).companyMember.findFirst({
        where: { userId: user.id, status: "ACTIVE" },
      });
      if (member) companyId = member.companyId;
    } catch (e) {}

    const now = new Date();
    
    // Find notifications matching the user's email or companyId that are currently active
    const notifications = await prisma.infraCostNotification.findMany({
      where: {
        OR: [
          ...(companyId ? [{ companyId }] : []),
          ...(user.email ? [{ email: user.email }] : []),
        ],
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("GET /api/users/me/infra-costs Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
