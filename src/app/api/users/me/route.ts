import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "propnex_secret_jwt_key_2026_key";

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
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    let companyId: string | null = null;
    let contractId: string | null = null;
    let companyStatus: string | null = null;

    try {
      const member = await (prisma as any).companyMember.findFirst({
        where: { userId: user.id, status: "ACTIVE" },
        include: { company: { select: { id: true, contractId: true, status: true } } },
      });
      
      if (member?.company) {
        companyId = member.company.id;
        contractId = member.company.contractId;
        companyStatus = member.company.status;
      }
    } catch (e) {
      console.warn("Could not fetch company for user:", e);
    }

    return NextResponse.json({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: (user as any).phone || null,
        companyId,
        contractId,
        companyStatus,
      },
    });
  } catch (err: any) {
    console.error("GET /api/users/me failed:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
