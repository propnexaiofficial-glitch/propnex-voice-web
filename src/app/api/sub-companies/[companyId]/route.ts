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
      // 3. Rollback credits to parent company
      const remainingCredits = subCompany.creditBalance?.creditsRemaining || 0;
      if (remainingCredits > 0) {
        await tx.creditBalance.update({
          where: { companyId: parentCompanyId },
          data: {
            creditsRemaining: { increment: remainingCredits },
          },
        });
      }

      // 4. Preserve Call Logs: Reassign to parent company so they remain visible
      // We must iterate and append a suffix to prevent unique constraint errors on companyId_callLogId
      const callLogs = await tx.callLog.findMany({ 
        where: { companyId: companyId },
        select: { id: true, callLogId: true, publicId: true }
      });
      for (const log of callLogs) {
        await tx.callLog.update({
          where: { id: log.id },
          data: {
            companyId: parentCompanyId,
            callLogId: `${log.callLogId}-sub-${companyId.slice(-4)}`,
            publicId: `${log.publicId}-sub-${companyId.slice(-4)}`,
          }
        });
      }

      // 5. Unassign phone numbers (technically onDelete: SetNull handles this, 
      // but we do it explicitly just in case, and optionally link back to parent)
      const phoneNumbers = await tx.phoneNumber.findMany({ 
        where: { companyId: companyId },
        select: { id: true, phoneNumberId: true, publicId: true }
      });
      for (const phone of phoneNumbers) {
        await tx.phoneNumber.update({
          where: { id: phone.id },
          data: {
            companyId: null, 
            assignedParentTenantId: parentCompanyId,
            phoneNumberId: `${phone.phoneNumberId}-sub-${companyId.slice(-4)}`,
            publicId: `${phone.publicId}-sub-${companyId.slice(-4)}`,
          }
        });
      }

      // 6. Hard-delete sub-company assets manually to prevent MongoDB Prisma relation cascade errors
      const id = companyId;
      await tx.campaignInvitation.deleteMany({ where: { companyId: id } });
      await tx.supportRequest.deleteMany({ where: { companyId: id } });
      await tx.billingQuote.deleteMany({ where: { companyId: id } });
      await tx.callInternalNote.deleteMany({ where: { companyId: id } });
      await tx.callTranscript.deleteMany({ where: { callLog: { companyId: id } } });
      await tx.callLogProviderEvent.deleteMany({ where: { callLog: { companyId: id } } });
      
      // Call logs are reparented above, but this deletes any leftovers that weren't
      await tx.callLog.deleteMany({ where: { companyId: id } });
      await tx.dialerCall.deleteMany({ where: { companyId: id } });
      await tx.campaignExecution.deleteMany({ where: { companyId: id } });
      await tx.campaign.deleteMany({ where: { companyId: id } });
      await tx.outboundCampaign.deleteMany({ where: { companyId: id } });
      await tx.lead.deleteMany({ where: { companyId: id } });
      await tx.leadSource.deleteMany({ where: { companyId: id } });
      await tx.leadPipelineStage.deleteMany({ where: { companyId: id } });
      await tx.uploadedContact.deleteMany({ where: { companyId: id } });
      await tx.agentCommunicationChannel.deleteMany({ where: { companyId: id } });
      await tx.agentPromptTemplate.deleteMany({ where: { companyId: id } });
      await tx.knowledgeSource.deleteMany({ where: { companyId: id } });
      await tx.aiAgent.deleteMany({ where: { companyId: id } });
      await tx.companyChannel.deleteMany({ where: { companyId: id } });
      await tx.companySetupConfig.deleteMany({ where: { companyId: id } });
      await tx.companyContact.deleteMany({ where: { companyId: id } });
      await tx.companyBillingRates.deleteMany({ where: { companyId: id } });
      await tx.billingSubscription.deleteMany({ where: { companyId: id } });
      await tx.billingInvoice.deleteMany({ where: { companyId: id } });
      await tx.creditUsage.deleteMany({ where: { companyId: id } });
      await tx.creditBalance.deleteMany({ where: { companyId: id } });
      await tx.phoneNumber.deleteMany({ where: { companyId: id } });
      await tx.invitation.deleteMany({ where: { companyId: id } });
      await tx.companyMember.deleteMany({ where: { companyId: id } });
      await tx.apiKey.deleteMany({ where: { companyId: id } });
      await tx.auditLog.deleteMany({ where: { companyId: id } });
      await tx.notification.deleteMany({ where: { companyId: id } });
      await tx.systemEvent.deleteMany({ where: { companyId: id } });
      await tx.analyticsSnapshot.deleteMany({ where: { companyId: id } });
      await tx.schedulerEvent.deleteMany({ where: { companyId: id } });
      await tx.integration.deleteMany({ where: { companyId: id } });
      await tx.webhookEndpoint.deleteMany({ where: { companyId: id } });
      await tx.csvImportBatch.deleteMany({ where: { companyId: id } });
      await tx.role.deleteMany({ where: { companyId: id } });
      await tx.channel.deleteMany({ where: { companyId: id } });
      await tx.companyResourceSequence.deleteMany({ where: { companyId: id } });

      // Finally delete the company itself
      await tx.company.delete({
        where: { id: companyId },
      });
    }, { maxWait: 15000, timeout: 30000 });

    return NextResponse.json({ success: true, message: "Sub-company deleted and credits rolled back" });
  } catch (err: any) {
    console.error("DELETE sub-company error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete sub-company" },
      { status: 500 }
    );
  }
}
