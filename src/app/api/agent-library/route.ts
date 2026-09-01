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
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const userId = decoded.userId;

    const agents = await prisma.agentLibraryEntry.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { deployedAgents: true } },
      },
    });

    // Find all pending agent assignment request notifications for this user
    const notifResult = await prisma.$runCommandRaw({
      find: "Notification",
      filter: {
        userId: { $oid: userId },
        type: "SYSTEM",
        title: "Agent Assignment Request",
        readAt: null,
      },
      projection: { "data": 1 },
      limit: 200,
    }) as any;

    const requestedAgentIds = new Set<string>(
      ((notifResult?.cursor?.firstBatch as any[]) || [])
        .map((n: any) => n?.data?.agentId)
        .filter(Boolean)
    );

    const mapped = agents.map((agent: any) => ({
      ...agent,
      // assigned = admin has flipped the agent to Yes (isPublished=true)
      assigned: agent.isPublished === true,
      // requested = this user sent a request that is still pending (not yet dismissed)
      requested: requestedAgentIds.has(agent.id),
      _count: agent._count,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("Agent library GET error", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
