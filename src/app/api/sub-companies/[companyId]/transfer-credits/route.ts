import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "propnex_secret_jwt_key_2026_key";

export async function POST(
  req: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.sub || decoded.id;

    // Verify the caller is an active member
    const member = await (prisma as any).companyMember.findFirst({
      where: { userId, status: "ACTIVE" },
      include: { company: { include: { creditBalance: true } } }
    });

    if (!member?.companyId) {
      return NextResponse.json({ error: "User is not in a company" }, { status: 400 });
    }

    const parentCompany = member.company;
    const parentBalance = parentCompany.creditBalance;

    if (!parentBalance) {
      return NextResponse.json({ error: "Main company has no credit balance record" }, { status: 400 });
    }

    const body = await req.json();
    const { amount, action } = body;
    const transferAmount = Number(amount) || 0;

    if (transferAmount <= 0) {
      return NextResponse.json({ error: "Invalid transfer amount" }, { status: 400 });
    }

    // Fetch the target sub-company
    const subCompanyId = params.companyId;
    const subCompany = await prisma.company.findFirst({
      where: { id: subCompanyId, parentCompanyId: parentCompany.id },
      include: { creditBalance: true }
    });

    if (!subCompany) {
      return NextResponse.json({ error: "Sub-company not found or access denied" }, { status: 404 });
    }

    const subBalance = subCompany.creditBalance;
    if (!subBalance) {
      return NextResponse.json({ error: "Sub-company has no credit balance record" }, { status: 400 });
    }

    if (action === "ADD") {
      // Transfer from parent to sub-company
      if (parentBalance.creditsRemaining < transferAmount) {
        return NextResponse.json({ error: "Insufficient credits in main company account" }, { status: 400 });
      }

      await prisma.$transaction([
        prisma.creditBalance.update({
          where: { id: parentBalance.id },
          data: { creditsRemaining: { decrement: transferAmount } }
        }),
        prisma.creditBalance.update({
          where: { id: subBalance.id },
          data: { creditsRemaining: { increment: transferAmount } }
        })
      ]);

      return NextResponse.json({ success: true, message: "Credits added successfully" });
    } else if (action === "REDUCE") {
      // Transfer from sub-company back to parent
      if (subBalance.creditsRemaining < transferAmount) {
        return NextResponse.json({ error: "Sub-company does not have enough credits to withdraw" }, { status: 400 });
      }

      await prisma.$transaction([
        prisma.creditBalance.update({
          where: { id: subBalance.id },
          data: { creditsRemaining: { decrement: transferAmount } }
        }),
        prisma.creditBalance.update({
          where: { id: parentBalance.id },
          data: { creditsRemaining: { increment: transferAmount } }
        })
      ]);

      return NextResponse.json({ success: true, message: "Credits withdrawn successfully" });
    } else {
      return NextResponse.json({ error: "Invalid action. Must be ADD or REDUCE" }, { status: 400 });
    }

  } catch (err: any) {
    console.error("POST transfer-credits error:", err);
    return NextResponse.json({ error: err.message || "Failed to transfer credits" }, { status: 500 });
  }
}
