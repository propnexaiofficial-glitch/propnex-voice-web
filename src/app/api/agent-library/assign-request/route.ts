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
    const { agentId } = await req.json();

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

    // Check if an unread notification already exists for this agent assignment request
    const existingNotifications = await prisma.notification.findMany({
      where: {
        companyId,
        type: "SYSTEM",
        title: "Agent Assignment Request",
        readAt: null,
      },
    });

    const alreadyRequested = existingNotifications.some((n: any) => n.data && typeof n.data === 'object' && n.data.agentId === agentId);
    
    if (alreadyRequested) {
      // Notification already exists and hasn't been read/cut by admin
      return NextResponse.json({ success: true, message: "Already requested" });
    }

    // Create a new Notification for the Admin Panel
    await prisma.notification.create({
      data: {
        userId,
        companyId,
        type: "SYSTEM",
        title: "Agent Assignment Request",
        body: `User ${user?.firstName} ${user?.lastName} requested assignment for ${agent.name}`,
        data: {
          agentId,
          agentName: agent.name,
          userName: `${user?.firstName} ${user?.lastName}`.trim(),
          userEmail: user?.email,
        }
      }
    });

    // Trigger webhook for email notifications
    const webhookUrl = process.env.APPS_SCRIPT_WEBHOOK_URL;
    if (webhookUrl) {
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
        body: JSON.stringify({ type: "agent_assign_request_admin", ...payload }),
      }).catch(console.error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Agent assignment request error", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
