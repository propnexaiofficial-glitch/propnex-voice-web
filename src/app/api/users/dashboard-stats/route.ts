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
      where: { userId, status: "ACTIVE" },
      include: { company: true }
    });

    if (!member?.companyId) {
      return NextResponse.json({ inboundCalls: 0, outboundCalls: 0, activeAgents: 0, creditsUsed: 0 });
    }

    const inboundCalls = await prisma.callLog.count({
      where: { companyId: member.companyId, direction: "INBOUND" }
    });

    const outboundCalls = await prisma.callLog.count({
      where: { companyId: member.companyId, direction: "OUTBOUND" }
    });

    const activeAgents = await (prisma as any).aiAgent.count({
      where: { companyId: member.companyId, status: "ACTIVE" }
    });

    const callStats = await prisma.callLog.aggregate({
      where: { companyId: member.companyId },
      _sum: { creditsUsed: true }
    });

    const creditsUsed = callStats._sum.creditsUsed || 0;

    return NextResponse.json({
      inboundCalls,
      outboundCalls,
      activeAgents,
      creditsUsed
    });
  } catch (err: any) {
    console.error("Dashboard stats error:", err);
    return NextResponse.json({ inboundCalls: 0, outboundCalls: 0, activeAgents: 0, creditsUsed: 0, error: err.message || err.toString() });
  }
}
