import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "propnex_secret_jwt_key_2026_key";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
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
    const { agentId, assign } = await req.json();

    const companyMember = await prisma.companyMember.findFirst({
      where: { userId },
      include: { company: true },
    });
    const companyId = companyMember?.companyId;

    if (!companyId) return new NextResponse("No company found", { status: 400 });

    const agent = await prisma.agentLibraryEntry.findUnique({
      where: { id: agentId },
    });

    if (!agent) return new NextResponse("Agent not found", { status: 404 });

    const user = await prisma.user.findUnique({ where: { id: userId } });

    // Handle DB assignment
    if (assign) {
      // Create AiAgent for this company based on library entry
      await prisma.aiAgent.create({
        data: {
          companyId,
          name: agent.name,
          description: agent.profile,
          type: agent.defaultType as any,
          status: "ACTIVE",
          libraryEntryId: agent.id,
          resourceKey: `res_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        },
      });
    } else {
      // Remove the assigned AiAgent for this company
      await prisma.aiAgent.deleteMany({
        where: { companyId, libraryEntryId: agent.id },
      });
    }

    // Trigger webhook for email notifications
    const webhookUrl = process.env.APPS_SCRIPT_WEBHOOK_URL;
    if (webhookUrl) {
      const typeAdmin = assign ? "agent_assigned_admin" : "agent_revoked_admin";
      const typeUser = assign ? "agent_assigned_user" : "agent_revoked_user";
      
      const payload = {
        userName: user ? `${user.firstName} ${user.lastName}`.trim() : "User",
        userEmail: user?.email || "",
        companyName: companyMember.company.name,
        agentName: agent.name,
        agentUrl: agent.demoAudioUrl,
      };

      // Notify Admin
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: typeAdmin, ...payload }),
      }).catch(console.error);

      // Notify User
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: typeUser, ...payload }),
      }).catch(console.error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Agent assignment error", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
