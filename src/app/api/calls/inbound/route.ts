import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "propnex_secret_jwt_key_2026_key";

function getCoreNumber(num: string) {
  if (!num) return "";
  let d = num.replace(/\D/g, "").replace(/^0+/, "");
  if (d.startsWith("91") && d.length >= 10) {
    d = d.substring(2);
  }
  return d;
}

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

    const assignedNumber = searchParams.get("assignedNumber");
    const callerNumber = searchParams.get("callerNumber");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const minDuration = searchParams.get("minDuration");
    const durationUnit = searchParams.get("durationUnit") || "sec";
    const search = searchParams.get("search");

    const whereClause: any = {
      companyId: { in: companyIdsToQuery },
      direction: "INBOUND",
    };

    console.log("INBOUND_API: searchParams received:", {
      assignedNumber,
      callerNumber,
      search,
      minDuration,
      durationUnit
    });

    if (assignedNumber) {
      const core = getCoreNumber(assignedNumber);
      if (core) {
        whereClause.phoneNumber = { number: { contains: core } };
      }
    }

    if (callerNumber) {
      const core = getCoreNumber(callerNumber);
      if (core) {
        whereClause.lead = { phone: { contains: core } };
      }
    }

    if (dateFrom || dateTo) {
      whereClause.startedAt = {};
      if (dateFrom) whereClause.startedAt.gte = new Date(dateFrom);
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        whereClause.startedAt.lte = toDate;
      }
    }

    if (minDuration) {
      let minSec = parseFloat(minDuration);
      if (!isNaN(minSec)) {
        if (durationUnit === "min") {
          minSec = minSec * 60;
        }
        whereClause.durationSeconds = { gte: minSec };
      }
    }

    if (search) {
      const core = getCoreNumber(search);
      if (core) {
        whereClause.OR = [
          { lead: { phone: { contains: core } } },
          { phoneNumber: { number: { contains: core } } },
        ];
      } else {
        whereClause.OR = [
          { lead: { phone: { contains: search } } },
          { phoneNumber: { number: { contains: search } } },
        ];
      }
    }

    console.log("INBOUND_API: whereClause is:", JSON.stringify(whereClause, null, 2));

    const [total, calls] = await Promise.all([
      prisma.callLog.count({ where: whereClause }),
      prisma.callLog.findMany({
        where: whereClause,
        orderBy: { startedAt: "desc" },
        skip,
        take: limit,
        distinct: ['callLogId'],
        include: { phoneNumber: true, lead: true },
      })
    ]);

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
