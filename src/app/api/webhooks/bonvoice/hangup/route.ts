import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Strip a phone number to its core 10 digits (no country code, no leading 0).
 * E.g. "07946350796" → "7946350796"
 *      "917946350796" → "7946350796"
 *      "+917946350796" → "7946350796"
 */
function corePhone(number: any): string | null {
  if (!number) return null;
  const digits = String(number).replace(/\D/g, "");
  // Remove leading 91 (India country code)
  const no91 = digits.replace(/^91/, "");
  // Remove leading 0
  const no0 = no91.replace(/^0+/, "");
  return no0 || null;
}

/**
 * Generate all possible formats for a phone number to use in DB lookup.
 * E.g. "07946350796" → ["7946350796", "07946350796", "917946350796", "+917946350796"]
 */
function phoneVariants(number: any): string[] {
  if (!number) return [];
  const raw = String(number);
  const core = corePhone(raw);
  if (!core) return [raw];
  return [
    core,
    `0${core}`,
    `91${core}`,
    `+91${core}`,
    raw,
  ].filter((v, i, a) => a.indexOf(v) === i); // deduplicate
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

    // Bonvoice sends CallDuration instead of callDuration in some versions
    const actualDuration = CallDuration || callDuration || 0;

    // ── Parse numbers from callID if missing ────────────────────────────────
    // Format: UUID.ext-DID-CALLER-DATE-TIME (e.g. 1788955197.876345-7946350796-8851860838-20260909-172958)
    if (callID && typeof callID === "string" && callID.includes("-")) {
      const parts = callID.split("-");
      if (parts.length >= 3) {
        if (!DisplayNumber && !DestinationNumber) DisplayNumber = parts[1];
        if (!SourceNumber) SourceNumber = parts[2];
      }
    }

    // ── Determine direction ─────────────────────────────────────────────────
    // Bonvoice: Direction = "Inbound" | "OutBound" | "Outbound"
    const directionRaw = Direction ? String(Direction).toLowerCase() : "";
    const isInbound = directionRaw === "" || directionRaw === "inbound";

    // ── Map fields to DID and caller per direction ──────────────────────────
    // INBOUND:  DID = DestinationNumber (or DisplayNumber), Caller = SourceNumber
    // OUTBOUND: DID = SourceNumber (or DisplayNumber),     Caller = DestinationNumber
    let didNumber: string;
    let callerNumber: string;

    if (isInbound) {
      didNumber    = String(DestinationNumber || DisplayNumber || "");
      callerNumber = String(SourceNumber || "");
    } else {
      didNumber    = String(SourceNumber || DisplayNumber || "");
      callerNumber = String(DestinationNumber || "");
    }

    console.log(`Bonvoice Hangup: direction=${isInbound ? "INBOUND" : "OUTBOUND"}, DID=${didNumber}, caller=${callerNumber}`);

    const recordingUrl = ResourceURL || resource_url || "";
    const durationSec  = parseInt(String(actualDuration)) || 0;
    const callCost     = cost ? parseFloat(String(cost)) : 0;

    // Credit Logic: 1.75 credits per 30s block for inbound, 3.5 for outbound
    let creditsUsed = 0;
    if (durationSec > 0) {
      const blocks = Math.ceil(durationSec / 30);
      creditsUsed = blocks * (isInbound ? 1.75 : 3.5);
    }

    const didVariants    = phoneVariants(didNumber);
    const callerCore     = corePhone(callerNumber);

    let callLog: any    = null;
    let phoneNumber: any = null;
    let lead: any        = null;

    // ── 1. Find active call log by callID ─────────────────────────────────
    if (callID) {
      callLog = await prisma.callLog.findFirst({
        where: { providerCallId: String(callID) },
      });
    }

    // ── 2. Find active call log by DID (ringing/answered) ─────────────────
    if (!callLog && didVariants.length > 0) {
      callLog = await prisma.callLog.findFirst({
        where: {
          status:      { in: ["RINGING", "ANSWERED", "QUEUED"] },
          phoneNumber: { number: { in: didVariants } },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    // ── 3. Find PhoneNumber record by DID variants ─────────────────────────
    // Prefer sub-company's own PhoneNumber over parent-shared records
    if (didVariants.length > 0 && (!callLog || !callLog.phoneNumberId)) {
      const candidates = await prisma.phoneNumber.findMany({
        where: { number: { in: didVariants } },
        include: { company: { select: { parentCompanyId: true } } },
      });
      // Prefer sub-company's own number (company has a parentCompanyId)
      phoneNumber = candidates.find((p: any) => p.company?.parentCompanyId)
                 ?? candidates[0]
                 ?? null;
      console.log(`Bonvoice Hangup: DID variants [${didVariants.join(", ")}] → found ${candidates.length} candidates, picked: ${phoneNumber ? `${phoneNumber.number} (company: ${phoneNumber.companyId})` : "NONE"}`);
    }

    // ── 4. Link lead from caller number ────────────────────────────────────
    const targetCompanyId = callLog?.companyId || phoneNumber?.companyId;
    if (callerCore && targetCompanyId) {
      lead = await prisma.lead.findFirst({
        where: {
          companyId: targetCompanyId,
          phone:     { contains: callerCore },
        },
      });
    }

    const startTimeStr   = StartTime ? `${String(StartTime).replace(" ", "T")}+05:30` : undefined;
    const startTimeParsed = startTimeStr ? new Date(startTimeStr) : new Date();
    const endTimeStr     = EndTime ? `${String(EndTime).replace(" ", "T")}+05:30` : undefined;
    const endTimeParsed  = endTimeStr ? new Date(endTimeStr) : new Date();

    let finalCallLogId = callLog?.id;

    if (callLog) {
      // ── 5a. Update existing call log ──────────────────────────────────────
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
          ...(lead && !callLog.leadId ? { leadId: lead.id } : {}),
          ...(phoneNumber && !callLog.phoneNumberId ? { phoneNumberId: phoneNumber.id } : {}),
        },
      });
    } else if (phoneNumber) {
      // ── 5b. Create a new COMPLETED call log ───────────────────────────────
      const newLog = await prisma.callLog.create({
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
      finalCallLogId = newLog.id;
      console.log(`Bonvoice Hangup: Created new call log ${newLog.id} for company ${phoneNumber.companyId}, DID=${didNumber}`);
    } else {
      console.error("Bonvoice Hangup: Could not match call to any PhoneNumber. DID variants tried:", didVariants, "Full payload:", data);
    }

    // ── 6. Deduct Credits ──────────────────────────────────────────────────
    if (creditsUsed > 0 && targetCompanyId) {
      try {
        await prisma.$transaction(async (tx) => {
          await tx.creditUsage.create({
            data: {
              companyId:   targetCompanyId,
              amount:      creditsUsed,
              reason:      "CALL",
              callLogId:   finalCallLogId,
              description: `Bonvoice ${isInbound ? "inbound" : "outbound"} call (${durationSec}s, ${creditsUsed.toFixed(2)} credits)`,
            },
          });

          await tx.creditBalance.upsert({
            where:  { companyId: targetCompanyId },
            create: {
              companyId:         targetCompanyId,
              creditsRemaining:  Math.max(0, -creditsUsed),
              creditsUsed:       creditsUsed,
            },
            update: {
              creditsRemaining: { decrement: creditsUsed },
              creditsUsed:      { increment: creditsUsed },
            },
          });
        });
      } catch (err) {
        console.error("Bonvoice Hangup: Failed to deduct credits", err);
      }
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

export async function GET() {
  return NextResponse.json({ success: true });
}
