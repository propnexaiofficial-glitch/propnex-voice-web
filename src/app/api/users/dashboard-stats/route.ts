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
      activeAgents,
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

    const creditsUsedByCalls = callStats._sum.creditsUsed || 0;
    const pastCreditsUsed = pastCallStats._sum.creditsUsed || 0;
    const inboundCreditsUsed = inboundCreditStats._sum.creditsUsed || 0;
    const outboundCreditsUsed = outboundCreditStats._sum.creditsUsed || 0;

    // Credits Used = Main account creditsUsed + ALL sub-company creditsUsed
    // e.g. Main: 1,086.25 + Sub: 113.75 = 1,200 ✓
    // This matches the "Main Used + Sub Used" shown in the credit balance card.
    let creditsUsed = creditsUsedByCalls; // fallback to call log sum
    try {
      const allCreditBalances = await (prisma as any).creditBalance.findMany({
        where: { companyId: { in: companyIdsToQuery } },
        select: { creditsUsed: true }
      });
      if (allCreditBalances && allCreditBalances.length > 0) {
        creditsUsed = allCreditBalances.reduce(
          (acc: number, cb: any) => acc + (cb.creditsUsed || 0), 0
        );
      }
    } catch (e) {}

    // We no longer use fake baselines. If past is 0, they get a +100% or 0% naturally.
    const calcTrend = (current: number, past: number) => {
      if (past === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - past) / past) * 100);
    };

    const finalOutboundCredits = outboundCreditsUsed;
    const finalInboundCredits = Math.max(0, creditsUsed - finalOutboundCredits);

    return NextResponse.json({
      inboundCalls,
      outboundCalls,
      activeAgents,
      creditsUsed,
      inboundCreditsUsed: finalInboundCredits,
      outboundCreditsUsed: finalOutboundCredits,
      isNewAccount,
      inboundTrend:  isNewAccount ? 0 : calcTrend(inboundCalls,  pastInboundCalls),
      outboundTrend: isNewAccount ? 0 : calcTrend(outboundCalls, pastOutboundCalls),
      creditsTrend:  isNewAccount ? 0 : calcTrend(creditsUsedByCalls, pastCreditsUsed),
      agentsTrend: 0
    });
  } catch (err: any) {
    console.error("Dashboard stats error:", err);
    return NextResponse.json({ inboundCalls: 0, outboundCalls: 0, activeAgents: 0, creditsUsed: 0, error: err.message || err.toString() });
  }
}
