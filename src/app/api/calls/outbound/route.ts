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
      return whereClause;
    };

    // Fetch skip + limit from EACH company to guarantee correct global sorting and pagination
    const fetchLimit = skip + limit;
    
    const promises = companyIdsToQuery.map(cId => 
      prisma.callLog.findMany({
        where: getWhereClause(cId),
        orderBy: { startedAt: "desc" },
        take: fetchLimit,
        include: { 
          phoneNumber: true, 
          lead: true,
          campaign: { include: { phoneNumbers: { take: 1 } } },
          company: { include: { phoneNumbers: { where: { direction: { in: ["OUTBOUND", "BOTH"] } }, take: 1 } } }
        }
      })
    );
    
    const results = await Promise.all(promises);
    
    // Merge, sort globally by date, and then paginate
    const allCalls = results.flat().sort((a, b) => 
      new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
    
    const mappedCalls = allCalls.slice(skip, skip + limit).map(call => {
      const minutes = Math.floor((call.durationSeconds || 0) / 60);
      const seconds = (call.durationSeconds || 0) % 60;
      
      // Aggressively extract assigned/DID number from all available JSON fields
      let fallbackAssignedNumber = "";
      
      // 1. Try providerWebhook
      if (call.providerWebhook && typeof call.providerWebhook === 'object') {
        const wh: any = call.providerWebhook;
        fallbackAssignedNumber = 
          wh.agentNumber || wh.did_number || wh.didNumber || wh.assigned_number ||
          wh.from_number || wh.message?.call?.agent?.number || wh.call?.agent?.number ||
          wh.call?.did_number || wh.data?.did_number || wh.data?.agentNumber || "";
      }

      // 2. Try providerRequest (sent payload usually has the DID)
      if (!fallbackAssignedNumber && call.providerRequest && typeof call.providerRequest === 'object') {
        const req: any = call.providerRequest;
        fallbackAssignedNumber =
          req.did_number || req.didNumber || req.agentNumber || req.from_number ||
          req.agent?.number || req.call?.did_number || "";
      }

      // 3. Try providerResponse
      if (!fallbackAssignedNumber && call.providerResponse && typeof call.providerResponse === 'object') {
        const res: any = call.providerResponse;
        fallbackAssignedNumber =
          res.did_number || res.didNumber || res.agentNumber || res.from || "";
      }

      // 4. Try campaign's linked phone number
      const campaignDid = (call as any).campaign?.phoneNumbers?.[0]?.number || "";

      // 5. Try the company's default outbound phone number
      const companyDid = (call as any).company?.phoneNumbers?.[0]?.number || "";

      return {
        id: call.id,
        callId: call.callLogId,
        customerNumber: call.lead?.phone || "",
        assignedNumber: call.phoneNumber?.number || fallbackAssignedNumber || campaignDid || companyDid || "+917969007102",
        callDateTime: call.startedAt.toISOString(),
        duration: minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`,
        durationSeconds: call.durationSeconds || 0,
        status: call.status.toLowerCase(),
        creditsUsed: call.creditsUsed || 0,
        recordingUrl: call.recordingUrl || undefined,
        transcriptUrl: call.transcriptUrl || undefined,
        transcript: [],
        liveStartedAt: (call.status === "RINGING" || call.status === "ANSWERED" || call.status === "IN-PROGRESS") ? call.startedAt.toISOString() : undefined,
      };
    });

    let total = 0;
    const countPromises = companyIdsToQuery.map(cId => 
      prisma.callLog.count({ where: getWhereClause(cId) })
    );
    const counts = await Promise.all(countPromises);
    total = counts.reduce((sum, current) => sum + current, 0);

    return NextResponse.json({
      data: mappedCalls,
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

export async function PUT(req: NextRequest) {
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
      return NextResponse.json({ message: "No company found" }, { status: 400 });
    }

    const body = await req.json();
    
    if (body.action === "fail" && body.phone) {
      const core = getCoreNumber(body.phone);
      if (core) {
        // Mark ALL PENDING calls for this phone as FAILED to prevent stuck states
        let updateData: any = { status: "FAILED" };
        if (body.assignedNumber) {
           updateData.providerWebhook = { did_number: body.assignedNumber };
        }
        
        const updated = await prisma.callLog.updateMany({
          where: {
            companyId: member.companyId,
            status: "PENDING",
            lead: {
              phone: { contains: core }
            }
          },
          data: updateData
        });

        return NextResponse.json({ success: true, count: updated.count });
      }
    }
    
    return NextResponse.json({ success: false, message: "Invalid request or no pending call found" });
  } catch (err: any) {
    console.error("Failed to update outbound call:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
