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

    // Fetch skip + limit from EACH company to guarantee correct global sorting and pagination
    const fetchLimit = skip + limit;
    
    // Get all phone numbers owned by these companies
    const phones = await prisma.phoneNumber.findMany({
      where: { 
        OR: [
          { companyId: { in: companyIdsToQuery } },
          { assignedParentTenantId: { in: companyIdsToQuery } }
        ]
      },
      select: { id: true }
    });
    const phoneIds = phones.map(p => p.id);

    const promises = companyIdsToQuery.map(cId => 
      prisma.callLog.findMany({
        where: { 
          OR: [
            { companyId: cId },
            { phoneNumberId: { in: phoneIds } }
          ],
          direction: "INBOUND" 
        },
        orderBy: { startedAt: "desc" },
        take: fetchLimit,
        include: { phoneNumber: true, lead: true }
      })
    );
    
    const results = await Promise.all(promises);
    
    // Merge, sort globally by date, and then paginate
    // Need to deduplicate since multiple cIds could fetch the same call via phoneNumberId
    const uniqueCallsMap = new Map();
    results.flat().forEach(call => uniqueCallsMap.set(call.id, call));
    const allCalls = Array.from(uniqueCallsMap.values()).sort((a, b) => 
      new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
    
    const calls = allCalls.slice(skip, skip + limit);

    const total = await prisma.callLog.count({
      where: { 
        OR: [
          { companyId: { in: companyIdsToQuery } },
          { phoneNumberId: { in: phoneIds } }
        ],
        direction: "INBOUND"
      }
    });

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
    console.error("Failed to fetch inbound calls:", err);
    return NextResponse.json({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 } });
  }
}
