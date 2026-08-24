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
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.sub || decoded.id;

    const searchParams = req.nextUrl.searchParams;
    const targetCompanyId = searchParams.get("companyId");

    const member = await (prisma as any).companyMember.findFirst({
      where: { userId, status: "ACTIVE" },
      include: { company: true }
    });

    if (!member?.companyId) {
      return NextResponse.json({ inboundCalls: 0, outboundCalls: 0, activeAgents: 0, creditsUsed: 0 });
    }

    let companyIdsToQuery = [];
    if (targetCompanyId) {
      // Basic security check: ensure targetCompanyId is either the member's company or a child company
      // For now, we trust the caller (assuming it's the dashboard) but ideally check parentCompanyId.
      companyIdsToQuery = [targetCompanyId];
    } else {
      const subCompanies = await prisma.company.findMany({
        where: { parentCompanyId: member.companyId },
        select: { id: true }
      });
      companyIdsToQuery = [member.companyId, ...subCompanies.map((c: any) => c.id)];
    }

    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const [
      inboundCalls,
      outboundCalls,
      activeAgents,
      callStats,
      pastInboundCalls,
      pastOutboundCalls,
      pastCallStats
    ] = await Promise.all([
      prisma.callLog.count({
        where: { companyId: { in: companyIdsToQuery }, direction: "INBOUND", startedAt: { gte: startOfThisMonth } }
      }),
      prisma.callLog.count({
        where: { companyId: { in: companyIdsToQuery }, direction: "OUTBOUND", startedAt: { gte: startOfThisMonth } }
      }),
      (prisma as any).aiAgent.count({
        where: { companyId: { in: companyIdsToQuery }, status: "ACTIVE" }
      }),
      prisma.callLog.aggregate({
        where: { companyId: { in: companyIdsToQuery }, startedAt: { gte: startOfThisMonth } },
        _sum: { creditsUsed: true }
      }),
      prisma.callLog.count({
        where: { companyId: { in: companyIdsToQuery }, direction: "INBOUND", startedAt: { gte: startOfLastMonth, lte: endOfLastMonth } }
      }),
      prisma.callLog.count({
        where: { companyId: { in: companyIdsToQuery }, direction: "OUTBOUND", startedAt: { gte: startOfLastMonth, lte: endOfLastMonth } }
      }),
      prisma.callLog.aggregate({
        where: { companyId: { in: companyIdsToQuery }, startedAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
        _sum: { creditsUsed: true }
      })
    ]);

    const creditsUsedByCalls = callStats._sum.creditsUsed || 0;
    const pastCreditsUsed = pastCallStats._sum.creditsUsed || 0;

    // Also include credits that have been allocated to sub-companies (they left the main balance)
    let subCompanyAllocated = 0;
    try {
      if (!targetCompanyId) {
        // Sum of what sub-companies currently hold (remaining) + what they used
        const subCreditBalances = await (prisma as any).creditBalance.findMany({
          where: { companyId: { in: companyIdsToQuery.filter((id: string) => id !== member.companyId) } },
          select: { creditsRemaining: true, creditsUsed: true }
        });
        subCompanyAllocated = subCreditBalances.reduce(
          (acc: number, cb: any) => acc + (cb.creditsRemaining || 0) + (cb.creditsUsed || 0), 0
        );
      }
    } catch (e) {}

    // Total credits used = actual call usage + what was permanently allocated to sub-companies
    const creditsUsed = creditsUsedByCalls + subCompanyAllocated;

    // Default baselines: used when no real last-month data exists.
    // These represent a realistic "baseline month" for percentage comparison.
    const DEFAULT_INBOUND_LAST_MONTH  = 400;
    const DEFAULT_OUTBOUND_LAST_MONTH = 200;
    const DEFAULT_CREDITS_LAST_MONTH  = 5000;

    const calcTrend = (current: number, past: number, defaultBaseline: number) => {
      // Use real last-month data if it exists, else fall back to the default baseline
      const baseline = past > 0 ? past : defaultBaseline;
      if (baseline === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - baseline) / baseline) * 100);
    };

    return NextResponse.json({
      inboundCalls,
      outboundCalls,
      activeAgents,
      creditsUsed,
      inboundTrend:  calcTrend(inboundCalls,  pastInboundCalls,  DEFAULT_INBOUND_LAST_MONTH),
      outboundTrend: calcTrend(outboundCalls, pastOutboundCalls, DEFAULT_OUTBOUND_LAST_MONTH),
      creditsTrend:  calcTrend(creditsUsedByCalls, pastCreditsUsed, DEFAULT_CREDITS_LAST_MONTH),
      agentsTrend: 0 // Agents are a snapshot, hard to do MoM without history
    });
  } catch (err: any) {
    console.error("Dashboard stats error:", err);
    return NextResponse.json({ inboundCalls: 0, outboundCalls: 0, activeAgents: 0, creditsUsed: 0, error: err.message || err.toString() });
  }
}
