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
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.sub || decoded.id;

    const member = await (prisma as any).companyMember.findFirst({
      where: { userId, status: "ACTIVE" }
    });

    if (!member?.companyId) {
      return NextResponse.json([]);
    }

    const subCompanies = await prisma.company.findMany({
      where: { parentCompanyId: member.companyId },
      include: { creditBalance: true }
    });

    const formatted = subCompanies.map(c => ({
      _id: c.id,
      companyName: c.name,
      companyEmail: c.email || "",
      contactPhone: c.phone || "",
      creditsUsed: c.creditBalance?.creditsUsed || 0,
      creditsRemaining: c.creditBalance?.creditsRemaining || 0,
      inboundCalls: 0,
      outboundCalls: 0,
      status: c.status || "ACTIVE",
      createdAt: c.createdAt
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("GET sub-companies error:", err);
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.sub || decoded.id;

    const member = await (prisma as any).companyMember.findFirst({
      where: { userId, status: "ACTIVE" },
      include: { company: { include: { creditBalance: true } } }
    });

    if (!member?.companyId) {
      return NextResponse.json({ error: "User is not in a company" }, { status: 400 });
    }

    const body = await req.json();
    const { companyName, companyEmail, allocatedCredits } = body;
    const credits = Number(allocatedCredits) || 0;

    const parentBalance = member.company.creditBalance;
    if (!parentBalance || parentBalance.creditsRemaining < credits) {
      return NextResponse.json({ error: "Insufficient credits in main company account" }, { status: 400 });
    }

    // 1. Deduct credits from parent
    await prisma.creditBalance.update({
      where: { id: parentBalance.id },
      data: {
        creditsRemaining: { decrement: credits }
      }
    });

    // 2. Create child company
    const newCompany = await prisma.company.create({
      data: {
        name: companyName,
        email: companyEmail,
        parentCompanyId: member.companyId,
        status: "ACTIVE"
      }
    });

    // 3. Create credit balance for child
    await prisma.creditBalance.create({
      data: {
        companyId: newCompany.id,
        creditsRemaining: credits,
        creditsUsed: 0
      }
    });

    return NextResponse.json({
      _id: newCompany.id,
      companyName: newCompany.name,
      companyEmail: newCompany.email || "",
      contactPhone: newCompany.phone || "",
      creditsUsed: 0,
      creditsRemaining: credits,
      status: newCompany.status,
      createdAt: newCompany.createdAt
    });
  } catch (err: any) {
    console.error("POST sub-companies error:", err);
    return NextResponse.json({ error: err.message || "Failed to create sub-company" }, { status: 500 });
  }
}
