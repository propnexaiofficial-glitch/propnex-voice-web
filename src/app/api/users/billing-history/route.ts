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
      return NextResponse.json([]);
    }

    const usages = await prisma.creditUsage.findMany({
      where: { companyId: member.companyId },
      orderBy: { createdAt: "desc" },
      take: 50
    });

    const history = usages.map((u: any) => {
      let type = "usage";
      let credits = -Math.abs(u.amount);
      let desc = u.description || "Usage Charge";

      if (u.reason === "PURCHASE") {
        type = "top-up";
        credits = Math.abs(u.amount);
        desc = u.description || "Credit Top-up";
      } else if (u.reason === "MANUAL_ADJUSTMENT") {
        type = "deduction";
        desc = u.description || "Miscellaneous Fees";
      }

      return {
        id: u.id,
        date: u.createdAt.toISOString(),
        description: desc,
        amount: 0, // Not explicitly tracked in DB for this view, mock as 0
        credits: credits,
        status: "completed",
        type: type
      };
    });

    return NextResponse.json(history);
  } catch (err: any) {
    console.error("Failed to fetch billing history:", err);
    return NextResponse.json([]);
  }
}
