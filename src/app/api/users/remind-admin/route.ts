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

    const userId = decoded.sub || decoded.id;
    if (!userId) {
      return NextResponse.json({ message: "Invalid token payload" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Find the latest pending approval for this user
    const pending = await prisma.pendingApproval.findFirst({
      where: { email: user.email },
      orderBy: { createdAt: 'desc' }
    });

    if (!pending) {
       return NextResponse.json({ message: "No pending approval found" }, { status: 404 });
    }

    // Check 24-hour block perfectly
    if (pending.remindedAt) {
       const timeSince = Date.now() - pending.remindedAt.getTime();
       if (timeSince < 24 * 60 * 60 * 1000) {
          return NextResponse.json({ error: "24h_lock", message: "You can only send a reminder once every 24 hours." }, { status: 429 });
       }
    }

    // Update remindedAt in the database perfectly
    await prisma.pendingApproval.update({
       where: { id: pending.id },
       data: { remindedAt: new Date() }
    });

    // TODO: Ideally we should create a Notification record for the admin, but it requires a companyId.
    // The Admin panel will just show these recently reminded approvals at the top.

    return NextResponse.json({ success: true, message: "Reminder sent successfully" });
  } catch (err: any) {
    console.error("POST /api/users/remind-admin failed:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
