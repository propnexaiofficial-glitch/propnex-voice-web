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
    });

    if (!member?.companyId) {
      return NextResponse.json({
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 1 },
      });
    }

    const { searchParams } = new URL(req.url);
    const targetCompanyId = searchParams.get("companyId");

    let companyIdsToQuery: string[] = [];

    if (targetCompanyId && targetCompanyId !== member.companyId) {
      // Viewing a specific sub-company — verify it belongs to this parent
      const subCompany = await prisma.company.findFirst({
        where: { id: targetCompanyId, parentCompanyId: member.companyId },
      });
      companyIdsToQuery = subCompany ? [targetCompanyId] : [member.companyId];
    } else {
      // Viewing all: parent + every child
      const subCompanies = await prisma.company.findMany({
        where: { parentCompanyId: member.companyId },
        select: { id: true },
      });
      companyIdsToQuery = [
        member.companyId,
        ...subCompanies.map((c: any) => c.id),
      ];
    }

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // ── Fetch all relevant calls in one query ────────────────────────────────
    // The webhook stores ONE record per company for each physical call
    // (one for the sub-company, one for the parent). We fetch all of them
    // and then deduplicate by callLogId so we show each call only once.
    const allRawCalls = await prisma.callLog.findMany({
      where: {
        companyId: { in: companyIdsToQuery },
        direction: "INBOUND",
      },
      orderBy: { startedAt: "desc" },
      // over-fetch so pagination stays correct after dedup
      take: (skip + limit) * companyIdsToQuery.length + 100,
      include: { phoneNumber: true, lead: true },
    });

    // ── Deduplicate ───────────────────────────────────────────────────────────
    // Same physical call appears once per company in the DB.
    // We keep the sub-company record (more specific) over the parent record.
    const uniqueMap = new Map<string, any>();
    for (const call of allRawCalls) {
      const key = call.callLogId || call.id;
      const existing = uniqueMap.get(key);
      if (!existing) {
        uniqueMap.set(key, call);
      } else {
        // Replace with sub-company record if current entry is from parent
        const existingIsParent = existing.companyId === member.companyId;
        const callIsParent = call.companyId === member.companyId;
        if (existingIsParent && !callIsParent) {
          uniqueMap.set(key, call);
        }
      }
    }

    const sorted = Array.from(uniqueMap.values()).sort(
      (a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );

    const calls = sorted.slice(skip, skip + limit);
    const total = uniqueMap.size;

    return NextResponse.json({
      data: calls,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err: any) {
    console.error("Failed to fetch inbound calls:", err);
    return NextResponse.json({
      data: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 1 },
    });
  }
}
