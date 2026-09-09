import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 1.75 credits per 30s block inbound, 3.5 outbound
function phoneVariants(number: any): string[] {
  if (!number) return [];
  const raw = String(number).trim();
  const digits = raw.replace(/\D/g, "");
  const no91 = digits.replace(/^91/, "");
  const core = no91.replace(/^0+/, "");
  if (!core) return [raw];
  return [...new Set([core, `0${core}`, `91${core}`, `+91${core}`, raw])];
}

function corePhone(number: any): string | null {
  if (!number) return null;
  const digits = String(number).replace(/\D/g, "");
  const no91 = digits.replace(/^91/, "");
  const core = no91.replace(/^0+/, "");
  return core || null;
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let data: any;

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const text = await req.text();
      data = Object.fromEntries(new URLSearchParams(text));
    } else {
      data = await req.json();
    }

    console.log("Bonvoice Hangup Webhook:", JSON.stringify(data, null, 2));

    const { callID, Direction, StartTime, EndTime, cost, ResourceURL, resource_url } = data;
    let { SourceNumber, DestinationNumber, DisplayNumber, callDuration, CallDuration } = data;

    // Duration: Bonvoice sends CallDuration in seconds
    const actualDuration = CallDuration ?? callDuration ?? 0;

    // Parse numbers from callID if missing
    if (callID && typeof callID === "string" && callID.includes("-")) {
      const parts = callID.split("-");
      if (parts.length >= 3) {
        if (!DisplayNumber && !DestinationNumber) DisplayNumber = parts[1];
        if (!SourceNumber) SourceNumber = parts[2];
      }
    }

    // Determine direction
    const directionRaw = Direction ? String(Direction).toLowerCase() : "";
    const isInbound = directionRaw === "" || directionRaw === "inbound";

    // Map DID and caller per direction
    // INBOUND:  DID = DestinationNumber or DisplayNumber, Caller = SourceNumber
    // OUTBOUND: DID = SourceNumber or DisplayNumber,      Caller = DestinationNumber
    const didNumber    = isInbound
      ? String(DestinationNumber || DisplayNumber || "").trim()
      : String(SourceNumber || DisplayNumber || "").trim();
    const callerNumber = isInbound
      ? String(SourceNumber || "").trim()
      : String(DestinationNumber || "").trim();

    console.log(`Bonvoice Hangup: dir=${isInbound ? "INBOUND" : "OUTBOUND"} DID=${didNumber} caller=${callerNumber} callID=${callID}`);

    const recordingUrl = ResourceURL || resource_url || "";
    const durationSec  = parseInt(String(actualDuration)) || 0;
    const callCost     = cost ? parseFloat(String(cost)) : 0;

    // Credit calculation: 1.75 credits per 30s block inbound, 3.5 outbound
    let creditsUsed = 0;
    if (durationSec > 0) {
      const blocks = Math.ceil(durationSec / 30);
      creditsUsed = blocks * (isInbound ? 1.75 : 3.5);
    }

    const didVariants = phoneVariants(didNumber);
    const callerCore  = corePhone(callerNumber);

    let callLog: any    = null;
    let phoneNumber: any = null;
    let lead: any        = null;

    // 1. Find existing call log by callID
    if (callID) {
      callLog = await prisma.callLog.findFirst({
        where: { providerCallId: String(callID) },
      });
    }

    // 2. Find call log by DID (RINGING/ANSWERED status)
    if (!callLog && didVariants.length > 0) {
      callLog = await prisma.callLog.findFirst({
        where: {
          status:      { in: ["RINGING", "ANSWERED", "QUEUED"] },
          phoneNumber: { number: { in: didVariants } },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    // 3. Find PhoneNumber record — prefer sub-company's own number
    if (didVariants.length > 0 && (!callLog || !callLog.phoneNumberId)) {
      const candidates = await prisma.phoneNumber.findMany({
        where: { number: { in: didVariants } },
        include: { company: { select: { parentCompanyId: true } } },
      });
      phoneNumber = candidates.find((p: any) => p.company?.parentCompanyId)
                 ?? candidates[0]
                 ?? null;
      console.log(`Bonvoice Hangup: DID [${didVariants.join(", ")}] → ${candidates.length} candidates, picked: ${phoneNumber ? `${phoneNumber.number} (company: ${phoneNumber.companyId})` : "NONE"}`);
    }

    // 4. Find lead by caller number
    const targetCompanyId = callLog?.companyId || phoneNumber?.companyId;
    if (callerCore && targetCompanyId) {
      lead = await prisma.lead.findFirst({
        where: {
          companyId: targetCompanyId,
          phone:     { contains: callerCore },
        },
      });
    }

    const startTimeParsed = StartTime
      ? new Date(`${String(StartTime).replace(" ", "T")}+05:30`)
      : new Date();
    const endTimeParsed = EndTime
      ? new Date(`${String(EndTime).replace(" ", "T")}+05:30`)
      : new Date();

    let finalCallLogId = callLog?.id;

    if (callLog) {
      // 5a. Update existing call log → COMPLETED
      await prisma.callLog.update({
        where: { id: callLog.id },
        data: {
          status:          "COMPLETED",
          durationSeconds: durationSec,
          cost:            callCost,
          creditsUsed:     creditsUsed,
          recordingUrl:    recordingUrl || undefined,
          endedAt:         endTimeParsed,
          providerStatus:  "COMPLETED",
          providerWebhook: data,
          ...(lead && !callLog.leadId       ? { leadId: lead.id }           : {}),
          ...(phoneNumber && !callLog.phoneNumberId ? { phoneNumberId: phoneNumber.id } : {}),
        },
      });
      console.log(`Bonvoice Hangup: Updated call log ${callLog.id} → COMPLETED (${durationSec}s)`);
    } else if (phoneNumber) {
      // 5b. Create new COMPLETED call log (notification webhook may have been missed)
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
          recordingUrl:    recordingUrl || undefined,
          provider:        "BONVOICE",
          providerStatus:  "COMPLETED",
          providerWebhook: data,
        },
      });
      finalCallLogId = newLog.id;
      console.log(`Bonvoice Hangup: Created new call log ${newLog.id} → COMPLETED (${durationSec}s) company=${phoneNumber.companyId}`);
    } else {
      console.error("Bonvoice Hangup: No PhoneNumber matched. DID variants:", didVariants, "Full payload:", data);
    }

    // 6. Deduct credits
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
              companyId:        targetCompanyId,
              creditsRemaining: Math.max(0, -creditsUsed),
              creditsUsed:      creditsUsed,
            },
            update: {
              creditsRemaining: { decrement: creditsUsed },
              creditsUsed:      { increment: creditsUsed },
            },
          });
        });
      } catch (err) {
        console.error("Bonvoice Hangup: Failed to deduct credits:", err);
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
