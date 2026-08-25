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

    const userId = decoded.sub || decoded.id;
    if (!userId) {
      return NextResponse.json({ message: "Invalid token payload" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 401 });
    }

    let companyId: string | null = null;
    let contractId: string | null = null;
    let companyStatus: string | null = null;
    let companyBlockedUntil: string | null = null;
    let creditBalance: any = undefined;
    let assignedNumber: string | null = null;
    let assignedNumbersDetailed: any[] = [];

    try {
      const member = await (prisma as any).companyMember.findFirst({
        where: { userId: user.id, status: "ACTIVE" },
          include: { 
          company: { 
            select: { 
              id: true, 
              contractId: true, 
              status: true, 
              blockedUntil: true,
              creditBalance: true,
              channels: true
            } 
          } 
        },
      });
      
      if (member?.company) {
        companyId = member.company.id;
        contractId = member.company.contractId;
        companyStatus = member.company.status;
        companyBlockedUntil = member.company.blockedUntil;
        creditBalance = member.company.creditBalance;
        const mainChannels = member.company.channels;
        
        // Fetch the assigned phone numbers for this company AND its sub-companies
        const phoneRecords = await (prisma as any).phoneNumber.findMany({
          where: { 
            OR: [
              { companyId: member.company.id },
              { company: { parentCompanyId: member.company.id } }
            ],
            status: "ACTIVE" 
          },
          include: { company: { select: { name: true } } }
        });
        
        if (phoneRecords && phoneRecords.length > 0) {
          assignedNumber = phoneRecords.map((r: any) => r.number).join(", ");
          assignedNumbersDetailed = phoneRecords.map((r: any) => ({
             isMain: r.companyId === member.company.id,
             companyName: r.company?.name || "Unknown Company",
             number: r.number,
             direction: r.direction || null,
             channels: r.channels ?? null,
          }));
        } else {
          assignedNumber = "Not Assigned";
        }
      }
    } catch (e) {
      console.warn("Could not fetch company details for user:", e);
    }

    return NextResponse.json({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: (user as any).phone || null,
        companyId,
        contractId,
        companyStatus,
        companyBlockedUntil,
        creditBalance,
        assignedNumber,
        assignedNumbersDetailed,
      },
    });
  } catch (err: any) {
    console.error("GET /api/users/me failed:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
