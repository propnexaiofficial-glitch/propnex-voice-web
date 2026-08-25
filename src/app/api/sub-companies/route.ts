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
      include: { 
        creditBalance: true,
        phoneNumbers: { select: { number: true, direction: true, channels: true } }
      }
    });

    const subCompanyIds = subCompanies.map(c => c.id);
    const callCounts = await prisma.callLog.groupBy({
      by: ['companyId', 'direction'],
      where: { companyId: { in: subCompanyIds } },
      _count: { _all: true }
    });

    const formatted = subCompanies.map((c: any) => {
      const inbound = callCounts.find((cc: any) => cc.companyId === c.id && cc.direction === "INBOUND")?._count._all || 0;
      const outbound = callCounts.find((cc: any) => cc.companyId === c.id && cc.direction === "OUTBOUND")?._count._all || 0;
      const allNumbers: string[] = (c.phoneNumbers || []).map((p: any) => p.number).filter(Boolean);

      return {
        _id: c.id,
        companyName: c.name,
        companyEmail: "",
        contactPhone: allNumbers[0] || "",       // first number (backward-compat)
        assignedNumbers: c.phoneNumbers || [], // Return the full objects {number, direction}
        channels: c.channels || 0,
        creditsUsed: c.creditBalance?.creditsUsed || 0,
        creditsRemaining: c.creditBalance?.creditsRemaining || 0,
        inboundCalls: inbound,
        outboundCalls: outbound,
        status: c.status || "ACTIVE",
        createdAt: c.createdAt
      };
    });

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
        slug: companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString(36),
        contractId: Math.random().toString(36).substring(2, 12).toUpperCase().padEnd(10, '0'),
        cli: (companyName.substring(0, 3) || "SUB").toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase(),
        companyCode: "CC-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase(),
        parentCompanyId: member.companyId,
        status: "PENDING",
        tenantType: "CHILD"
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
      companyEmail: companyEmail || "",
      contactPhone: "",
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
