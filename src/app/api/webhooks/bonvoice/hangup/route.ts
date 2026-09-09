import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log("Received Bonvoice Hangup Webhook:", JSON.stringify(data, null, 2));

    // Bonvoice sends callType 2 on hangup
    // Fields: SourceNumber, DestinationNumber, DisplayNumber, callDuration,
    //         cost, ResourceURL (or resource_url), callID, Direction, Status, EndTime, StartTime

    const {
      SourceNumber,
      DestinationNumber,
      DisplayNumber,
      callDuration,
      cost,
      ResourceURL,
      resource_url,       // some payloads use lowercase
      callID,
      Direction,
      StartTime,
      EndTime,
    } = data;

    const recordingUrl = ResourceURL || resource_url || null;
    const durationSec   = callDuration ? parseInt(String(callDuration)) : 0;
    const callCost      = cost         ? parseFloat(String(cost))       : 0;

    // The DID number that was dialled (inbound) or our sending number (outbound)
    const didNumber = DisplayNumber || DestinationNumber;

    // 1️⃣ Try to find an existing RINGING / ANSWERED call log by correlationId (callID)
    let callLog = null;

    if (callID) {
      callLog = await prisma.callLog.findFirst({
        where: { providerCallId: String(callID) },
      });
    }

    // 2️⃣ If none found, try to find an active call log for this DID / phone
    if (!callLog && didNumber) {
      callLog = await prisma.callLog.findFirst({
        where: {
          status: { in: ["RINGING", "ANSWERED", "QUEUED"] },
          phoneNumber: { number: didNumber },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    // 3️⃣ If still none, create a new completed call log (inbound call that we missed tracking)
    if (!callLog) {
      // Resolve the phone number record
      const phoneNumber = await prisma.phoneNumber.findFirst({
        where: { number: didNumber || DestinationNumber },
      });

      if (phoneNumber) {
        const isInbound =
          !Direction || String(Direction).toUpperCase() === "INBOUND";

        callLog = await prisma.callLog.create({
          data: {
            callLogId:      `CL${Date.now()}`,
            publicId:       `bonvoice-${Date.now()}`,
            direction:      isInbound ? "INBOUND" : "OUTBOUND",
            status:         "COMPLETED",
            companyId:      phoneNumber.companyId ?? undefined,
            phoneNumberId:  phoneNumber.id,
            aiAgentId:      isInbound
                              ? (phoneNumber.inboundAgentId  ?? undefined)
                              : (phoneNumber.outboundAgentId ?? undefined),
            providerCallId: callID ? String(callID) : undefined,
            startedAt:      StartTime ? new Date(StartTime) : new Date(),
            endedAt:        EndTime   ? new Date(EndTime)   : new Date(),
            durationSeconds: durationSec,
            cost:            callCost,
            recordingUrl,
            provider:       "BONVOICE",
            providerStatus: "COMPLETED",
          },
        });
      }
    } else {
      // 4️⃣ Update the existing call log to COMPLETED
      await prisma.callLog.update({
        where: { id: callLog.id },
        data: {
          status:          "COMPLETED",
          durationSeconds: durationSec,
          cost:            callCost,
          recordingUrl,
          endedAt:         EndTime ? new Date(EndTime) : new Date(),
          providerStatus:  "COMPLETED",
          providerWebhook: data,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Bonvoice Hangup Webhook Error:", error?.message ?? error);
    return NextResponse.json(
      { error: "Internal Server Error", detail: error?.message },
      { status: 500 }
    );
  }
}
