import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "propnex_secret_jwt_key_2026_key";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.sub || decoded.id;

    // Support accessing params async in Next.js 15+ if needed, but in standard Next 14 this works.
    const companyId = (await params).companyId;

    // 1. Authenticate user and verify they belong to the parent company
    const member = await (prisma as any).companyMember.findFirst({
      where: { userId, status: "ACTIVE" },
      include: { company: true },
    });

    if (!member?.companyId) {
      return NextResponse.json(
        { error: "User is not in a company" },
        { status: 400 }
      );
    }

    const parentCompanyId = member.companyId;

    // 2. Verify the sub-company exists and belongs to this parent
    const subCompany = await prisma.company.findFirst({
      where: {
        id: companyId,
        parentCompanyId: parentCompanyId,
      },
      include: {
        creditBalance: true,
      },
    });

    if (!subCompany) {
      return NextResponse.json(
        { error: "Sub-company not found or access denied" },
        { status: 404 }
      );
    }

    // Run deletion in a transaction to ensure data integrity
    await prisma.$transaction(async (tx) => {
      // 3. Rollback credits and preserve creditsUsed to parent company
      const remainingCredits = subCompany.creditBalance?.creditsRemaining || 0;
      const usedCredits = subCompany.creditBalance?.creditsUsed || 0;
      if (remainingCredits > 0 || usedCredits > 0) {
        await tx.creditBalance.update({
          where: { companyId: parentCompanyId },
          data: {
            creditsRemaining: { increment: remainingCredits },
            creditsUsed: { increment: usedCredits },
          },
        });
      }

      // 4. Preserve Call Logs: Reassign to parent company so they remain visible
      // We must iterate and append a suffix to prevent unique constraint errors on companyId_callLogId
      const callLogs = await tx.callLog.findMany({ 
        where: { companyId: companyId },
        select: { id: true, callLogId: true, publicId: true }
      });
      if (callLogs.length > 0) {
        await Promise.all(
          callLogs.map((log) =>
            tx.callLog.update({
              where: { id: log.id },
              data: {
                companyId: parentCompanyId,
                callLogId: `${log.callLogId}-sub-${companyId.slice(-4)}`,
                publicId: `${log.publicId}-sub-${companyId.slice(-4)}`,
              }
            })
          )
        );
      }

      // 5. Unassign phone numbers (technically onDelete: SetNull handles this, 
      // but we do it explicitly just in case, and optionally link back to parent)
      const phoneNumbers = await tx.phoneNumber.findMany({ 
        where: { companyId: companyId },
        select: { id: true, phoneNumberId: true, publicId: true, number: true }
      });
      if (phoneNumbers.length > 0) {
        await Promise.all(
          phoneNumbers.map((phone) =>
            tx.phoneNumber.update({
              where: { id: phone.id },
              data: {
                companyId: null,
                assignedParentTenantId: parentCompanyId,
                phoneNumberId: `${phone.phoneNumberId}-sub-${companyId.slice(-4)}`,
                publicId: `${phone.publicId}-sub-${companyId.slice(-4)}`,
                number: `${phone.number}-sub-${companyId.slice(-4)}`,
              }
            })
          )
        );
      }

      // 6. Hard-delete sub-company assets manually to prevent MongoDB Prisma relation cascade errors
      await Promise.all([
        tx.campaignInvitation.deleteMany({ where: { companyId: companyId } }),
        tx.supportRequest.deleteMany({ where: { companyId: companyId } }),
        tx.billingQuote.deleteMany({ where: { companyId: companyId } }),
        tx.callInternalNote.deleteMany({ where: { companyId: companyId } }),
        tx.callTranscript.deleteMany({ where: { callLog: { companyId: companyId } } }),
        tx.callLogProviderEvent.deleteMany({ where: { callLog: { companyId: companyId } } }),
        tx.contactRetryJob.deleteMany({ where: { companyId: companyId } }),
        tx.campaignDocument.deleteMany({ where: { companyId: companyId } }),
        tx.campaignActivity.deleteMany({ where: { companyId: companyId } }),
        
        tx.callLog.deleteMany({ where: { companyId: companyId } }),
        tx.dialerCall.deleteMany({ where: { companyId: companyId } }),
        tx.campaignExecution.deleteMany({ where: { companyId: companyId } }),
        tx.campaign.deleteMany({ where: { companyId: companyId } }),
        tx.outboundCampaign.deleteMany({ where: { companyId: companyId } }),
        tx.lead.deleteMany({ where: { companyId: companyId } }),
        tx.leadSource.deleteMany({ where: { companyId: companyId } }),
        tx.leadPipelineStage.deleteMany({ where: { companyId: companyId } }),
        tx.uploadedContact.deleteMany({ where: { companyId: companyId } }),
        tx.agentCommunicationChannel.deleteMany({ where: { companyId: companyId } }),
        tx.agentPromptTemplate.deleteMany({ where: { companyId: companyId } }),
        tx.knowledgeSource.deleteMany({ where: { companyId: companyId } }),
        tx.aiAgent.deleteMany({ where: { companyId: companyId } }),
        tx.companyChannel.deleteMany({ where: { companyId: companyId } }),
        tx.companySetupConfig.deleteMany({ where: { companyId: companyId } }),
        tx.companyContact.deleteMany({ where: { companyId: companyId } }),
        tx.companyBillingRates.deleteMany({ where: { companyId: companyId } }),
        tx.billingSubscription.deleteMany({ where: { companyId: companyId } }),
        tx.billingInvoice.deleteMany({ where: { companyId: companyId } }),
        tx.creditUsage.deleteMany({ where: { companyId: companyId } }),
        tx.creditBalance.deleteMany({ where: { companyId: companyId } }),
        tx.phoneNumber.deleteMany({ where: { companyId: companyId } }),
        tx.invitation.deleteMany({ where: { companyId: companyId } }),
        tx.companyMember.deleteMany({ where: { companyId: companyId } }),
        tx.apiKey.deleteMany({ where: { companyId: companyId } }),
        tx.auditLog.deleteMany({ where: { companyId: companyId } }),
        tx.notification.deleteMany({ where: { companyId: companyId } }),
        tx.systemEvent.deleteMany({ where: { companyId: companyId } }),
        tx.analyticsSnapshot.deleteMany({ where: { companyId: companyId } }),
        tx.schedulerEvent.deleteMany({ where: { companyId: companyId } }),
        tx.integration.deleteMany({ where: { companyId: companyId } }),
        tx.webhookEndpoint.deleteMany({ where: { companyId: companyId } }),
        tx.csvImportBatch.deleteMany({ where: { companyId: companyId } }),
        tx.role.deleteMany({ where: { companyId: companyId } }),
        tx.channel.deleteMany({ where: { companyId: companyId } }),
        tx.companyResourceSequence.deleteMany({ where: { companyId: companyId } }),
      ]);
      
      // Finally delete the company itself
      await tx.company.delete({ where: { id: companyId } });
    }, { maxWait: 15000, timeout: 60000 });

    return NextResponse.json({ success: true, message: "Sub-company deleted and credits rolled back" });
  } catch (err: any) {
    console.error("DELETE sub-company error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete sub-company" },
      { status: 500 }
    );
  }
}
