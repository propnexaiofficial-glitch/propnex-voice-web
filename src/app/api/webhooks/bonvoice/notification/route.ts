import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Generate all possible phone number formats for DB lookup.
 * e.g. "07946350796" → ["7946350796", "07946350796", "917946350796", "+917946350796"]
 */
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

/**
 * Map Bonvoice notification payload to our internal call status.
 * Per Bonvoice API docs:
 *   callType "0" = Call Initialization / Ringing
 *   callType "1" = Call Answered / Active
 *   callType "2" = Call Hangup (handled by hangup route)
 *   Status field can also be: "RINGING", "ANSWERED", "NO ANSWER", "BUSY", "FAILED"
 */
function mapBonvoiceStatus(data: any): string {
  // Prefer explicit Status field from Bonvoice (most reliable)
  const statusRaw = (data.Status || data.status || "").toString().toUpperCase().trim();
  if (statusRaw === "ANSWERED") return "ANSWERED";
  if (statusRaw === "RINGING" || statusRaw === "RING") return "RINGING";
  if (statusRaw === "NO ANSWER" || statusRaw === "NOANSWER" || statusRaw === "NO_ANSWER") return "MISSED";
  if (statusRaw === "BUSY") return "MISSED";
  if (statusRaw === "FAILED" || statusRaw === "CANCEL" || statusRaw === "CANCELLED") return "FAILED";

  // Fallback: use callType numeric value
  const callType = parseInt(String(data.callType ?? data.CallType ?? ""), 10);
  if (callType === 0) return "RINGING";
  if (callType === 1) return "ANSWERED";
  if (callType === 2) return "COMPLETED";

  return "RINGING"; // default for notification webhook
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

    console.log("Bonvoice Notification Webhook:", JSON.stringify(data, null, 2));

    const callID = data.callID || data.callId || data.call_id || data.uuid || "";
    const Direction = data.Direction || data.direction || "";
    const StartTime = data.StartTime || data.start_time || data.startTime || "";
    let SourceNumber = data.SourceNumber || data.source_number || data.sourceNumber || data.caller || "";
    let DestinationNumber = data.DestinationNumber || data.destination_number || data.destinationNumber || data.did || "";
    let DisplayNumber = data.DisplayNumber || data.display_number || data.displayNumber || "";

    // Parse numbers from callID if missing
    // Format: UUID.ext-DID-CALLER-DATE-TIME (e.g. 1788955197.876345-7946350796-8851860838-20260909-172958)
    if (callID && typeof callID === "string" && callID.includes("-")) {
      const parts = callID.split("-");
      if (parts.length >= 3) {
        if (!DisplayNumber && !DestinationNumber) DisplayNumber = parts[1];
        if (!SourceNumber) SourceNumber = parts[2];
      }
    }

    // Determine direction
    // Bonvoice: Direction = "Inbound" | "OutBound" | "Outbound" | "inbound"
    const directionRaw = Direction ? String(Direction).toLowerCase() : "";
    const isInbound = directionRaw === "" || directionRaw === "inbound";

    // Map fields per direction:
    // INBOUND:  DID = DestinationNumber or DisplayNumber, Caller = SourceNumber
    // OUTBOUND: DID = SourceNumber or DisplayNumber,      Caller = DestinationNumber
    const didNumber   = isInbound
      ? String(DestinationNumber || DisplayNumber || "").trim()
      : String(SourceNumber || DisplayNumber || "").trim();
    const callerNumber = isInbound
      ? String(SourceNumber || "").trim()
      : String(DestinationNumber || "").trim();

    const mappedStatus = mapBonvoiceStatus(data);

    console.log(`Bonvoice Notification: dir=${isInbound ? "INBOUND" : "OUTBOUND"} status=${mappedStatus} DID=${didNumber} caller=${callerNumber} callID=${callID}`);

    if (!didNumber) {
      console.log("Bonvoice Notification: No DID found, skipping.");
      return NextResponse.json({ success: true });
    }

    const didVariants  = phoneVariants(didNumber);
    const callerCore   = corePhone(callerNumber);

    // 1. Check for existing call logs by callID
    let existingLogs: any[] = [];
    if (callID) {
      existingLogs = await prisma.callLog.findMany({
        where: { providerCallId: String(callID) },
      });
    }

    if (existingLogs.length > 0) {
      // Update ALL existing logs for this call
      for (const log of existingLogs) {
        await prisma.callLog.update({
          where: { id: log.id },
          data: {
            status:     mappedStatus as any,
            answeredAt: mappedStatus === "ANSWERED" ? new Date() : undefined,
            providerWebhook: data,
          },
        });
      }
      console.log(`Bonvoice Notification: Updated ${existingLogs.length} call logs → ${mappedStatus}`);
    } else {
      // 2. Find ALL PhoneNumbers matching this DID
      const candidates = await prisma.phoneNumber.findMany({
        where: { number: { in: didVariants } },
        include: { company: { select: { parentCompanyId: true } } },
      });

      console.log(`Bonvoice Notification: DID variants [${didVariants.join(", ")}] → ${candidates.length} candidate(s) found.`);

      if (candidates.length === 0) {
        console.warn("Bonvoice Notification: No PhoneNumber matched in DB. Proceeding without company linkage.");
        await prisma.callLog.create({
          data: {
            callLogId:       `CL${Date.now()}`,
            publicId:        `bonvoice-${Date.now()}`,
            direction:       isInbound ? "INBOUND" : "OUTBOUND",
            status:          mappedStatus as any,
            providerCallId:  callID ? String(callID) : undefined,
            startedAt:       StartTime ? new Date(`${String(StartTime).replace(" ", "T")}+05:30`) : new Date(),
            answeredAt:      mappedStatus === "ANSWERED" ? new Date() : undefined,
            provider:        "BONVOICE",
            providerStatus:  mappedStatus,
            providerWebhook: data,
          },
        });
      } else {
        // Create a CallLog for EVERY matched PhoneNumber so it shows up in EVERY sub-company dashboard perfectly
        for (const phoneNumber of candidates) {
          let lead: any = null;
          if (callerCore && phoneNumber.companyId) {
            lead = await prisma.lead.findFirst({
              where: {
                companyId: phoneNumber.companyId,
                phone:     { contains: callerCore },
              },
            });
          }

          const newLog = await prisma.callLog.create({
            data: {
              callLogId:       `CL${Date.now()}-${phoneNumber.id.substring(0, 5)}`,
              publicId:        `bonvoice-${Date.now()}-${phoneNumber.id.substring(0, 5)}`,
              direction:       isInbound ? "INBOUND" : "OUTBOUND",
              status:          mappedStatus as any,
              companyId:       phoneNumber.companyId ?? undefined,
              phoneNumberId:   phoneNumber.id,
              leadId:          lead?.id ?? undefined,
              aiAgentId:       isInbound ? (phoneNumber.inboundAgentId ?? undefined) : (phoneNumber.outboundAgentId ?? undefined),
              providerCallId:  callID ? String(callID) : undefined,
              startedAt:       StartTime ? new Date(`${String(StartTime).replace(" ", "T")}+05:30`) : new Date(),
              answeredAt:      mappedStatus === "ANSWERED" ? new Date() : undefined,
              provider:        "BONVOICE",
              providerStatus:  mappedStatus,
              providerWebhook: data,
            },
          });
          console.log(`Bonvoice Notification: Created call log ${newLog.id} status=${mappedStatus} for company=${phoneNumber.companyId}`);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Bonvoice Notification Webhook Error:", error?.message ?? error);
    return NextResponse.json({ success: true }); // always 200 so Bonvoice doesn't retry
  }
}

export async function GET() {
  return NextResponse.json({ success: true });
}
