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

    const member = await (prisma as any).companyMember.findFirst({
      where: { userId, status: "ACTIVE" }
    });

    if (!member?.companyId) {
      return NextResponse.json([]);
    }

    const subCompanies = await prisma.company.findMany({
      where: { parentCompanyId: member.companyId },
      select: { id: true }
    });
    
    const companyIdsToQuery = [member.companyId, ...subCompanies.map((c: any) => c.id)];

    // Run a separate query for each companyId to perfectly utilize the [companyId, startedAt] index
    // and avoid MongoDB in-memory sort limits when using the $in operator.
    const promises = companyIdsToQuery.map(cId => 
      prisma.callLog.findMany({
        where: { companyId: cId },
        orderBy: { startedAt: "desc" },
        take: 20
      })
    );
    
    const results = await Promise.all(promises);
    
    // Merge and sort the results in memory
    const allRecentCalls = results.flat().sort((a, b) => 
      new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
    
    const recentCalls = allRecentCalls.slice(0, 20);

    const activity = recentCalls.map(call => ({
      id: call.id,
      type: call.direction === "INBOUND" ? "inbound" : "outbound",
      title: `${call.direction === "INBOUND" ? "Inbound" : "Outbound"} Call`,
      description: `Call with ${call.durationSeconds}s duration`,
      timestamp: call.startedAt.toISOString()
    }));

    return NextResponse.json(activity);
  } catch (err) {
    console.error("Recent activity error:", err);
    return NextResponse.json([]);
  }
}
