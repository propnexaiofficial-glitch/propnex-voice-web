import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateToken } from "@/lib/validate-token";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const result = await validateToken(req.headers.get("authorization"));
    if (result instanceof NextResponse) return result;
    const { userId } = result;

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
          include: { 
            company: { select: { name: true } }
          }
        });
        
        if (phoneRecords && phoneRecords.length > 0) {
          assignedNumber = phoneRecords.map((r: any) => r.number).join(", ");
          assignedNumbersDetailed = phoneRecords.map((r: any) => ({
             isMain: r.companyId === member.company.id,
             companyName: r.company?.name || "Unknown Company",
             number: r.number,
             direction: r.direction || null,
             channels: r.channels ?? null,
             agentUrl: r.agentUrl || null,
          }));
        } else {
          assignedNumber = "Not Assigned";
        }
      }
    } catch (e) {
      console.warn("Could not fetch company details for user:", e);
    }

    let approvalStatus: string | null = null;
    let remindedAt: string | null = null;
    let rejectedAt: string | null = null;
    try {
      // Find the latest pending approval for this user
      const pending = await prisma.pendingApproval.findFirst({
        where: { email: user.email },
        orderBy: { createdAt: 'desc' }
      });
      if (pending) {
        approvalStatus = pending.status;
        remindedAt = (pending as any).remindedAt?.toISOString() || null;
        if (pending.status === "REJECTED") {
           rejectedAt = pending.updatedAt?.toISOString() || null;
        }
      }
    } catch (e) {
      console.warn("Could not fetch pending approval:", e);
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
        approvalStatus,
        remindedAt,
        rejectedAt,
        status: (user as any).status || null,
        blockedUntil: (user as any).blockedUntil || null
      },
    });
  } catch (err: any) {
    console.error("GET /api/users/me failed:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
