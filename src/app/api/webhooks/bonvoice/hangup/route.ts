import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ── billing rate ─────────────────────────────────────────────────────────────
// Adjust this to match your Propnex credit rate per second
const CREDITS_PER_SECOND = 0.1;

function corePhone(num: string | undefined): string {
  if (!num) return "";
  return String(num).replace(/\D/g, "").replace(/^0+/, "").replace(/^91/, "");
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log("Bonvoice Hangup Webhook:", JSON.stringify(data, null, 2));

    const {
      SourceNumber,
      DestinationNumber,
      DisplayNumber,
      callDuration,
      cost,
      ResourceURL,
      resource_url,
      callID,
      Direction,
      StartTime,
      EndTime,
    } = data;

    const recordingUrl  = ResourceURL || resource_url || null;
    const durationSec   = callDuration ? parseInt(String(callDuration)) : 0;
    const callCost      = cost ? parseFloat(String(cost)) : 0;
    const creditsUsed   = parseFloat((durationSec * CREDITS_PER_SECOND).toFixed(2));

    const isInbound     = !Direction || String(Direction).toUpperCase() === "INBOUND";
    const didNumber     = DisplayNumber || (isInbound ? DestinationNumber : SourceNumber);
    const callerNumber  = isInbound ? SourceNumber : DestinationNumber;
    const callerCore    = corePhone(callerNumber);
    const didCore       = corePhone(didNumber);

    // ── 1. Try to find existing call log by callID ────────────────────────────
    let callLog: any = null;
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

    // ── 3. Resolve the DID PhoneNumber record ────────────────────────────────
    const phoneNumber = await prisma.phoneNumber.findFirst({
      where: { number: { contains: didCore || didNumber || "" } },
    });

    // ── 4. Try to match caller to an existing Lead ───────────────────────────
    let lead: any = null;
    if (callerCore && phoneNumber?.companyId) {
      lead = await prisma.lead.findFirst({
        where: {
          companyId: phoneNumber.companyId,
          phone:     { contains: callerCore },
        },
      });
    }

    if (callLog) {
      // ── 5a. Update existing call log ─────────────────────────────────────
      await prisma.callLog.update({
        where: { id: callLog.id },
        data: {
          status:          "COMPLETED",
          durationSeconds: durationSec,
          cost:            callCost,
          creditsUsed,
          recordingUrl,
          endedAt:         EndTime ? new Date(EndTime) : new Date(),
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
          startedAt:       StartTime ? new Date(StartTime) : new Date(),
          endedAt:         EndTime   ? new Date(EndTime)   : new Date(),
          durationSeconds: durationSec,
          cost:            callCost,
          creditsUsed,
          recordingUrl,
          provider:        "BONVOICE",
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
