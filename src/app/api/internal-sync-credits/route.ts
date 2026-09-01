import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      include: { creditBalance: true }
    });

    const results = [];

    for (const company of companies) {
      if (!company.creditBalance) continue;
      
      const callLogs = await prisma.callLog.findMany({
        where: { companyId: company.id }
      });

      let totalCreditsUsed = 0;
      for (const log of callLogs) {
        totalCreditsUsed += log.creditsUsed || 0;
      }

      // Also include manual deductions made by admins
      const manualUsages = await prisma.creditUsage.findMany({
        where: { companyId: company.id, reason: "MANUAL_ADJUSTMENT" }
      });
      for (const usage of manualUsages) {
        totalCreditsUsed += usage.amount || 0;
      }

      if (totalCreditsUsed !== company.creditBalance.creditsUsed) {
        const diff = totalCreditsUsed - company.creditBalance.creditsUsed;
        
        await prisma.creditBalance.update({
          where: { id: company.creditBalance.id },
          data: {
            creditsUsed: totalCreditsUsed,
            creditsRemaining: { decrement: diff }
          }
        });
        
        results.push(`Company ${company.name}: Updated credits used from ${company.creditBalance.creditsUsed} to ${totalCreditsUsed}. Decremented remaining by ${diff}`);
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error("Sync credits error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
