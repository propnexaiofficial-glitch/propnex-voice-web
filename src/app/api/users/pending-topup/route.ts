import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "propnex_secret_jwt_key_2026_key";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    
    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.sub || decoded.id;

    const existing = await prisma.supportRequest.findFirst({
      where: { userId, reason: "BILLING_CREDITS", status: "NEW" }
    });
    
    return NextResponse.json({ hasPending: !!existing });
  } catch (err: any) {
    return NextResponse.json({ hasPending: false });
  }
}
