import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 1.75 credits per 30 seconds block
function corePhone(number: any) {
  if (!number) return null;
  return String(number)
    .replace(/\D/g, "")
    .replace(/^0+/, "")
    .replace(/^91/, "");
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log("Bonvoice Hangup Webhook:", JSON.stringify(data, null, 2));

    const {
      callID,
      Direction,
      StartTime,
      EndTime,
      cost,
      ResourceURL,
      resource_url,
    } = data;

    let { SourceNumber, DestinationNumber, DisplayNumber, callDuration, CallDuration } = data;
    
    // Bonvoice sends CallDuration instead of callDuration
    const actualDuration = CallDuration || callDuration || 0;

    // Bonvoice sometimes doesn't send SourceNumber/DestinationNumber, but embeds it in callID
    // Format: UUID-DID-CALLER-DATE-TIME (e.g. 1788955197.876345-7946350796-8851860838-20260909-172958)
    if (callID && typeof callID === "string" && callID.includes("-")) {
      const parts = callID.split("-");
      if (parts.length >= 3) {
        if (!DisplayNumber && !DestinationNumber) DisplayNumber = parts[1];
        if (!SourceNumber) SourceNumber = parts[2];
      }
    }

    const isInbound     = !Direction || String(Direction).toUpperCase() === "INBOUND";
    const didNumber     = isInbound ? (DestinationNumber || DisplayNumber) : SourceNumber;
    const callerNumber  = isInbound ? SourceNumber : (DestinationNumber || DisplayNumber);

    const recordingUrl  = ResourceURL || resource_url || "";
    const durationSec   = parseInt(String(actualDuration));
    const callCost      = cost ? parseFloat(String(cost)) : 0;
    
    // Credit Logic: 1.75 credits for every 30 seconds (or fraction thereof)
    let creditsUsed = 0;
    if (durationSec > 0) {
      const blocks = Math.ceil(durationSec / 30);
      creditsUsed = blocks * 1.75;
    }

    const didCore       = corePhone(didNumber);
    const callerCore    = corePhone(callerNumber);

    let callLog = null;
    let phoneNumber: any = null;
    let lead: any = null;

    // ── 1. Try to find active call log by Call ID (set by notification webhook) ──
    if (callID) {
      callLog = await prisma.callLog.findFirst({
        where: { providerCallId: String(callID) },
      });
    }

    // ── 2. Try to find active call log by DID phone number ───────────────────
    if (!callLog && didCore) {
      callLog = await prisma.callLog.findFirst({
        where: {
          status:      { in: ["RINGING", "ANSWERED", "QUEUED"] },
          phoneNumber: { number: { contains: didCore } },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    // ── 3. Find Phone Number to link the call if not linked ──────────────────
    if (didCore && (!callLog || !callLog.phoneNumberId)) {
      phoneNumber = await prisma.phoneNumber.findFirst({
        where: { number: { contains: didCore } },
      });
    }

    // ── 4. Link Lead based on caller number ──────────────────────────────────
    const targetCompanyId = callLog?.companyId || phoneNumber?.companyId;
    if (callerCore && targetCompanyId) {
      lead = await prisma.lead.findFirst({
        where: {
          companyId: targetCompanyId,
          phone:     { contains: callerCore },
        },
      });
    }
    
    // Attempt to parse StartTime as local server time if needed, but new Date() is usually sufficient
    // as long as we have the duration and credits correctly calculated.
    const startTimeParsed = StartTime ? new Date(StartTime) : new Date();
    const endTimeParsed = EndTime ? new Date(EndTime) : new Date();

    if (callLog) {
      // ── 5a. Update existing call log ───────────────────────────────────────
      await prisma.callLog.update({
        where: { id: callLog.id },
        data: {
          status:          "COMPLETED",
          durationSeconds: durationSec,
          cost:            callCost,
          creditsUsed:     creditsUsed,
          recordingUrl:    recordingUrl,
          endedAt:         endTimeParsed,
          providerStatus:  "COMPLETED",
          providerWebhook: data,
          // Link lead if not already linked
          ...(lead && !callLog.leadId ? { leadId: lead.id } : {}),
        },
      });
    } else if (phoneNumber) {
      // ── 5b. Create a new COMPLETED call log ──────────────────────────────
      await prisma.callLog.create({
        data: {
          callLogId:       `CL${Date.now()}`,
          publicId:        `bonvoice-${Date.now()}`,
          direction:       isInbound ? "INBOUND" : "OUTBOUND",
          status:          "COMPLETED",
          companyId:       phoneNumber.companyId ?? undefined,
          phoneNumberId:   phoneNumber.id,
          leadId:          lead?.id ?? undefined,
          aiAgentId:       isInbound
                             ? (phoneNumber.inboundAgentId  ?? undefined)
                             : (phoneNumber.outboundAgentId ?? undefined),
          providerCallId:  callID ? String(callID) : undefined,
          startedAt:       startTimeParsed,
          endedAt:         endTimeParsed,
          durationSeconds: durationSec,
          cost:            callCost,
          creditsUsed:     creditsUsed,
          recordingUrl:    recordingUrl,
          provider:        "BONVOICE",
          providerStatus:  "COMPLETED",
          providerWebhook: data,
        },
      });
    } else {
      console.error("Bonvoice Hangup: Could not match call to any DID or existing log.", data);
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

export async function GET(req: Request) {
  return NextResponse.json({ success: true });
}
