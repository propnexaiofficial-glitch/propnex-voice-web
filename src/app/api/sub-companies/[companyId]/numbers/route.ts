import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "propnex_secret_jwt_key_2026_key";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const userId = decoded.sub || decoded.id;
    const { companyId } = await params;

    // Verify caller belongs to the parent company
    const member = await (prisma as any).companyMember.findFirst({
      where: { userId, status: "ACTIVE" },
      select: { companyId: true },
    });

    if (!member?.companyId) {
      return NextResponse.json({ error: "User is not in a company" }, { status: 400 });
    }

    // Verify sub-company belongs to the parent
    const subCompany = await prisma.company.findFirst({
      where: { id: companyId, parentCompanyId: member.companyId },
      select: { id: true },
    });

    if (!subCompany) {
      return NextResponse.json({ error: "Sub-company not found" }, { status: 404 });
    }

    const phoneNumbers = await (prisma as any).phoneNumber.findMany({
      where: { companyId, status: "ACTIVE" },
    });

    return NextResponse.json({ numbers: phoneNumbers });
  } catch (err: any) {
    console.error("GET /api/sub-companies/[companyId]/numbers failed:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
