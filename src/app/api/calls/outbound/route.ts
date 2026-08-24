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
      where: { userId, status: "ACTIVE" }
    });

    if (!member?.companyId) {
      return NextResponse.json({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 } });
    }

    const { searchParams } = new URL(req.url);
    const targetCompanyId = searchParams.get("companyId");
    
    let companyIdsToQuery = [member.companyId];

    if (targetCompanyId && targetCompanyId !== member.companyId) {
      // Check if targetCompanyId is a sub-company of the user's company
      const subCompany = await prisma.company.findFirst({
        where: { id: targetCompanyId, parentCompanyId: member.companyId }
      });
      if (subCompany) {
        companyIdsToQuery = [targetCompanyId];
      }
    } else {
      // Fetch parent + all child companies' calls
      const subCompanies = await prisma.company.findMany({
        where: { parentCompanyId: member.companyId },
        select: { id: true }
      });
      companyIdsToQuery = [member.companyId, ...subCompanies.map((c: any) => c.id)];
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

    const getWhereClause = (cId: string) => {
      const whereClause: any = { companyId: cId, direction: "OUTBOUND" };

      if (assignedNumber) {
        const core = getCoreNumber(assignedNumber);
        if (core) {
          whereClause.phoneNumber = { number: { contains: core } };
        }
      }

      if (callerNumber) {
        const core = getCoreNumber(callerNumber);
        if (core) {
          whereClause.customerNumber = { contains: core };
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
            { customerNumber: { contains: core } },
            { phoneNumber: { number: { contains: core } } },
          ];
        } else {
          whereClause.OR = [
            { customerNumber: { contains: search } },
            { phoneNumber: { number: { contains: search } } },
          ];
        }
      }
      return whereClause;
    };

    // Fetch skip + limit from EACH company to guarantee correct global sorting and pagination
    const fetchLimit = skip + limit;
    
    const promises = companyIdsToQuery.map(cId => 
      prisma.callLog.findMany({
        where: getWhereClause(cId),
        orderBy: { startedAt: "desc" },
        take: fetchLimit,
        include: { phoneNumber: true, lead: true }
      })
    );
    
    const results = await Promise.all(promises);
    
    // Merge, sort globally by date, and then paginate
    const allCalls = results.flat().sort((a, b) => 
      new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
    
    const calls = allCalls.slice(skip, skip + limit);

    let total = 0;
    const countPromises = companyIdsToQuery.map(cId => 
      prisma.callLog.count({ where: getWhereClause(cId) })
    );
    const counts = await Promise.all(countPromises);
    total = counts.reduce((sum, current) => sum + current, 0);

    return NextResponse.json({
      data: calls,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      }
    });
  } catch (err: any) {
    console.error("Failed to fetch outbound calls:", err);
    return NextResponse.json({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 } });
  }
}
