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

    const companyToVerifyId = targetCompanyId || member.companyId;
    const targetCompanyRecord = await prisma.company.findUnique({
      where: { id: companyToVerifyId },
      select: { createdAt: true }
    });

    // Check if account is < 30 days old
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const isNewAccount = targetCompanyRecord?.createdAt ? new Date(targetCompanyRecord.createdAt) > thirtyDaysAgo : false;


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

    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const [
      inboundCalls,
      outboundCalls,
      totalAgents,
      assignedAgents,
      callStats,
      pastInboundCalls,
      pastOutboundCalls,
      pastCallStats,
      inboundCreditStats,
      outboundCreditStats
    ] = await Promise.all([
      prisma.callLog.count({
        where: { companyId: { in: companyIdsToQuery }, direction: "INBOUND", startedAt: { gte: startOfThisMonth } }
      }),
      prisma.callLog.count({
        where: { companyId: { in: companyIdsToQuery }, direction: "OUTBOUND", startedAt: { gte: startOfThisMonth } }
      }),
      prisma.agentLibraryEntry.count(),
      prisma.agentLibraryEntry.count({ where: { isPublished: true } }),
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
      }),
      prisma.callLog.aggregate({
        where: { companyId: { in: companyIdsToQuery }, direction: "INBOUND" },
        _sum: { creditsUsed: true }
      }),
      prisma.callLog.aggregate({
        where: { companyId: { in: companyIdsToQuery }, direction: "OUTBOUND" },
        _sum: { creditsUsed: true }
      })
    ]);

    let creditsUsed = callStats._sum.creditsUsed || 0;
    let totalCreditLimit = 0;
    
    try {
      const allCreditBalances = await (prisma as any).creditBalance.findMany({
        where: { companyId: { in: companyIdsToQuery } },
        select: { creditsUsed: true, creditsRemaining: true }
      });
      if (allCreditBalances && allCreditBalances.length > 0) {
        creditsUsed = allCreditBalances.reduce(
          (acc: number, cb: any) => acc + (cb.creditsUsed || 0), 0
        );
        totalCreditLimit = allCreditBalances.reduce(
          (acc: number, cb: any) => acc + (cb.creditsUsed || 0) + (cb.creditsRemaining || 0), 0
        );
      }
    } catch (e) {}

    const creditsPercentage = totalCreditLimit > 0 ? Math.round((creditsUsed / totalCreditLimit) * 100) : 0;
    
    const availableAgents = totalAgents - assignedAgents;

    const creditsUsedByCalls = callStats._sum.creditsUsed || 0;
    const finalOutboundCredits = outboundCreditStats._sum.creditsUsed || 0;
    const finalInboundCredits = Math.max(0, creditsUsed - finalOutboundCredits);
    
    const pastCreditsUsed = pastCallStats._sum.creditsUsed || 0;

    const calcTrend = (current: number, past: number) => {
      if (past === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - past) / past) * 100);
    };

    return NextResponse.json({
      inboundCalls,
      outboundCalls,
      totalAgents,
      assignedAgents,
      availableAgents,
      creditsUsed,
      creditsPercentage,
      inboundCreditsUsed: finalInboundCredits,
      outboundCreditsUsed: finalOutboundCredits,
      isNewAccount,
      inboundTrend: calcTrend(inboundCalls, pastInboundCalls),
      outboundTrend: calcTrend(outboundCalls, pastOutboundCalls),
      creditsTrend: calcTrend(callStats._sum.creditsUsed || 0, pastCallStats._sum.creditsUsed || 0),
      agentsTrend: 0
    });
  } catch (err: any) {
    console.error("Dashboard stats error:", err);
    return NextResponse.json({ inboundCalls: 0, outboundCalls: 0, totalAgents: 0, creditsUsed: 0, error: err.message || err.toString() });
  }
}
