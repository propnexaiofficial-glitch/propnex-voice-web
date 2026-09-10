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

    const callID = data.callID || data.callId || data.call_id || data.uuid || "";
    const Direction = data.Direction || data.direction || "";
    const StartTime = data.StartTime || data.start_time || data.startTime || "";
    const EndTime = data.EndTime || data.end_time || data.endTime || "";
    const cost = data.cost || data.Cost || "";
    const ResourceURL = data.ResourceURL || data.resource_url || data.resourceUrl || "";
    
    let SourceNumber = data.SourceNumber || data.source_number || data.sourceNumber || data.caller || "";
    let DestinationNumber = data.DestinationNumber || data.destination_number || data.destinationNumber || data.did || "";
    let DisplayNumber = data.DisplayNumber || data.display_number || data.displayNumber || "";
    
    // Duration: Bonvoice sends CallDuration in seconds
    const actualDuration = data.CallDuration ?? data.callDuration ?? data.call_duration ?? data.duration ?? 0;

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

    // 1. Find existing call logs by callID
    let existingLogs: any[] = [];
    if (callID) {
      existingLogs = await prisma.callLog.findMany({
        where: { providerCallId: String(callID) },
      });
    }

    // 2. Find call logs by DID (RINGING/ANSWERED status) - as fallback if callID missing
    if (existingLogs.length === 0 && didVariants.length > 0) {
      existingLogs = await prisma.callLog.findMany({
        where: {
          status:      { in: ["RINGING", "ANSWERED", "QUEUED"] },
          phoneNumber: { number: { in: didVariants } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      });
      // Filter out old calls (older than 1 hour)
      existingLogs = existingLogs.filter((log: any) => Date.now() - log.createdAt.getTime() < 3600000);
    }

    const startTimeParsed = StartTime ? new Date(`${String(StartTime).replace(" ", "T")}+05:30`) : new Date();
    const endTimeParsed = EndTime ? new Date(`${String(EndTime).replace(" ", "T")}+05:30`) : new Date();

    const logsToCharge: { companyId: string; callLogId: string }[] = [];

    if (existingLogs.length > 0) {
      // 3a. Update ALL existing call logs → COMPLETED
      for (const log of existingLogs) {
        let lead: any = null;
        if (!log.leadId && callerCore && log.companyId) {
          lead = await prisma.lead.findFirst({
            where: { companyId: log.companyId, phone: { contains: callerCore } }
          });
        }

        await prisma.callLog.update({
          where: { id: log.id },
          data: {
            status:          "COMPLETED",
            durationSeconds: durationSec,
            cost:            callCost,
            creditsUsed:     creditsUsed,
            recordingUrl:    recordingUrl || undefined,
            endedAt:         endTimeParsed,
            providerStatus:  "COMPLETED",
            providerWebhook: data,
            ...(lead ? { leadId: lead.id } : {}),
          },
        });
        if (log.companyId) {
          logsToCharge.push({ companyId: log.companyId, callLogId: log.id });
        }
      }
      console.log(`Bonvoice Hangup: Updated ${existingLogs.length} call logs → COMPLETED (${durationSec}s)`);
    } else {
      // 3b. Create NEW COMPLETED call logs (if notification webhook was missed)
      const candidates = await prisma.phoneNumber.findMany({
        where: { number: { in: didVariants } },
        include: { company: true },
      });

      if (candidates.length === 0) {
        console.warn("Bonvoice Hangup: No PhoneNumber matched in DB. Proceeding without company linkage.");
        await prisma.callLog.create({
          data: {
            callLogId:       `CL${Date.now()}`,
            publicId:        `bonvoice-${Date.now()}`,
            direction:       isInbound ? "INBOUND" : "OUTBOUND",
            status:          "COMPLETED",
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
      } else {
        // Create for EVERY matched PhoneNumber
        for (const phoneNumber of candidates) {
          let lead: any = null;
          if (callerCore && phoneNumber.companyId) {
            lead = await prisma.lead.findFirst({
              where: { companyId: phoneNumber.companyId, phone: { contains: callerCore } },
            });
          }

          const newLog = await prisma.callLog.create({
            data: {
              callLogId:       `CL${Date.now()}-${phoneNumber.id.substring(0, 5)}`,
              publicId:        `bonvoice-${Date.now()}-${phoneNumber.id.substring(0, 5)}`,
              direction:       isInbound ? "INBOUND" : "OUTBOUND",
              status:          "COMPLETED",
              companyId:       phoneNumber.companyId ?? undefined,
              phoneNumberId:   phoneNumber.id,
              leadId:          lead?.id ?? undefined,
              aiAgentId:       isInbound ? (phoneNumber.inboundAgentId ?? undefined) : (phoneNumber.outboundAgentId ?? undefined),
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
          if (phoneNumber.companyId) {
            logsToCharge.push({ companyId: phoneNumber.companyId, callLogId: newLog.id });
          }
          console.log(`Bonvoice Hangup: Created new call log ${newLog.id} → COMPLETED (${durationSec}s) company=${phoneNumber.companyId}`);
        }
      }
    }

    // 4. Deduct credits for ALL companies involved
    if (creditsUsed > 0 && logsToCharge.length > 0) {
      for (const charge of logsToCharge) {
        try {
          await prisma.$transaction(async (tx) => {
            await tx.creditUsage.create({
              data: {
                companyId:   charge.companyId,
                amount:      creditsUsed,
                reason:      "CALL",
                callLogId:   charge.callLogId,
                description: `Bonvoice ${isInbound ? "inbound" : "outbound"} call (${durationSec}s, ${creditsUsed.toFixed(2)} credits)`,
              },
            });

            await tx.creditBalance.upsert({
              where:  { companyId: charge.companyId },
              create: {
                companyId:        charge.companyId,
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
          console.error("Bonvoice Hangup: Failed to deduct credits for company:", charge.companyId, err);
        }
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
