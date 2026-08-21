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

    const recentCalls = await prisma.callLog.findMany({
      where: { 
        OR: [
          { companyId: member.companyId },
          { company: { parentCompanyId: member.companyId } }
        ]
      },
      orderBy: { startedAt: "desc" },
      take: 5
    });

    const activity = recentCalls.map(call => ({
      id: call.id,
      type: call.direction === "INBOUND" ? "inbound" : "outbound",
      title: `${call.direction === "INBOUND" ? "Inbound" : "Outbound"} Call`,
      description: `Call with ${call.durationSeconds}s duration`,
      timestamp: new Date(call.startedAt).toLocaleString()
    }));

    return NextResponse.json(activity);
  } catch (err) {
    console.error("Recent activity error:", err);
    return NextResponse.json([]);
  }
}
