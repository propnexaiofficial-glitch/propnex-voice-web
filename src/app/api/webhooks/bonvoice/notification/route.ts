import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log("Received Bonvoice Call Notification Webhook:", data);

    const {
      callType,
      status,
      callID,
      Direction,
      StartTime,
    } = data;

    let { SourceNumber, DestinationNumber, DisplayNumber } = data;

    // Bonvoice sometimes doesn't send SourceNumber/DestinationNumber, but embeds it in callID
    // Format: UUID-DID-CALLER-DATE-TIME (e.g. 1788955197.876345-7946350796-8851860838-20260909-172958)
    if (callID && typeof callID === "string" && callID.includes("-")) {
      const parts = callID.split("-");
      if (parts.length >= 3) {
        if (!DisplayNumber && !DestinationNumber) DisplayNumber = parts[1];
        if (!SourceNumber) SourceNumber = parts[2];
      }
    }

    // Map callType to our status
    let mappedStatus: string = "RINGING";
    if (status) {
      mappedStatus = String(status).toUpperCase();
    } else if (callType !== undefined) {
      const ct = parseInt(String(callType));
      if (ct === 0) mappedStatus = "RINGING";
      else if (ct === 1) mappedStatus = "ANSWERED";
      else if (ct === 2) mappedStatus = "COMPLETED";
    }

    const didNumber = DisplayNumber || DestinationNumber;
    const isInbound = !Direction || String(Direction).toUpperCase() === "INBOUND";
    const callerNumber = isInbound ? SourceNumber : DestinationNumber;

    if (!didNumber || !callerNumber) {
      console.log("Bonvoice Notification: Missing phone numbers, skipping log creation.");
      return NextResponse.json({ success: true });
    }

    // 1️⃣ Try to find existing call log by callID
    let callLog = null;
    if (callID) {
      callLog = await prisma.callLog.findFirst({
        where: { providerCallId: String(callID) },
      });
    }

    if (callLog) {
      // Update existing call log status
      await prisma.callLog.update({
        where: { id: callLog.id },
        data: {
          status: mappedStatus as any,
          answeredAt: mappedStatus === "ANSWERED" ? new Date() : undefined,
        },
      });
    } else {
      // 2️⃣ Create a new RINGING call log so we can track it
      const phoneNumber = await prisma.phoneNumber.findFirst({
        where: { number: { contains: didNumber?.replace(/^0/, "") || "" } },
      });

      if (phoneNumber) {
        const callerCore = callerNumber
          ? String(callerNumber).replace(/\D/g, "").replace(/^0+/, "").replace(/^91/, "")
          : null;

        let lead = null;
        if (callerCore) {
          lead = await prisma.lead.findFirst({
            where: {
              companyId: phoneNumber.companyId ?? undefined,
              phone: { contains: callerCore },
            },
          });
        }

        await prisma.callLog.create({
          data: {
            callLogId:      `CL${Date.now()}`,
            publicId:       `bonvoice-${Date.now()}`,
            direction:      isInbound ? "INBOUND" : "OUTBOUND",
            status:         mappedStatus as any,
            companyId:      phoneNumber.companyId ?? undefined,
            phoneNumberId:  phoneNumber.id,
            leadId:         lead?.id ?? undefined,
            aiAgentId:      isInbound
                              ? (phoneNumber.inboundAgentId  ?? undefined)
                              : (phoneNumber.outboundAgentId ?? undefined),
            providerCallId: callID ? String(callID) : undefined,
            startedAt:      StartTime ? new Date(`${String(StartTime).replace(" ", "T")}+05:30`) : new Date(),
            answeredAt:     mappedStatus === "ANSWERED" ? new Date() : undefined,
            provider:       "BONVOICE",
            providerStatus: mappedStatus,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Bonvoice Notification Webhook Error:", error?.message ?? error);
    return NextResponse.json({ success: true }); // always 200 so Bonvoice doesn't retry
  }
}

export async function GET(req: Request) {
  return NextResponse.json({ success: true });
}
