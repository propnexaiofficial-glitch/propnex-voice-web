import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Generate all possible formats for a phone number for DB lookup.
 * Handles 0-prefix, 91 country code, +91, and raw digits.
 */
function phoneVariants(number: any): string[] {
  if (!number) return [];
  const raw = String(number).trim();
  const digits = raw.replace(/\D/g, "");
  const no91 = digits.replace(/^91/, "");
  const core = no91.replace(/^0+/, "");
  if (!core) return [raw];
  return [
    core,
    `0${core}`,
    `91${core}`,
    `+91${core}`,
    raw,
  ].filter((v, i, a) => v && a.indexOf(v) === i); // deduplicate, remove empty
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
    const data = await req.json();
    console.log("Bonvoice Notification Webhook:", JSON.stringify(data, null, 2));

    const {
      callType,
      status,
      callID,
      Direction,
      StartTime,
    } = data;

    let { SourceNumber, DestinationNumber, DisplayNumber } = data;

    // ── Parse numbers from callID if missing ─────────────────────────────────
    // Format: UUID.ext-DID-CALLER-DATE-TIME
    if (callID && typeof callID === "string" && callID.includes("-")) {
      const parts = callID.split("-");
      if (parts.length >= 3) {
        if (!DisplayNumber && !DestinationNumber) DisplayNumber = parts[1];
        if (!SourceNumber) SourceNumber = parts[2];
      }
    }

    // ── Map callType → status ─────────────────────────────────────────────────
    let mappedStatus = "RINGING";
    if (status) {
      mappedStatus = String(status).toUpperCase();
    } else if (callType !== undefined) {
      const ct = parseInt(String(callType));
      if (ct === 0) mappedStatus = "RINGING";
      else if (ct === 1) mappedStatus = "ANSWERED";
      else if (ct === 2) mappedStatus = "COMPLETED";
    }

    // ── Determine direction ───────────────────────────────────────────────────
    // Bonvoice: Direction = "Inbound" | "OutBound" | "Outbound"
    const directionRaw = Direction ? String(Direction).toLowerCase() : "";
    const isInbound = directionRaw === "" || directionRaw === "inbound";

    // ── Map fields per direction ──────────────────────────────────────────────
    // INBOUND:  DID = DestinationNumber (or DisplayNumber), Caller = SourceNumber
    // OUTBOUND: DID = SourceNumber (or DisplayNumber),      Caller = DestinationNumber
    let didNumber: string;
    let callerNumber: string;

    if (isInbound) {
      didNumber    = String(DestinationNumber || DisplayNumber || "");
      callerNumber = String(SourceNumber || "");
    } else {
      didNumber    = String(SourceNumber || DisplayNumber || "");
      callerNumber = String(DestinationNumber || "");
    }

    console.log(`Bonvoice Notification: direction=${isInbound ? "INBOUND" : "OUTBOUND"}, status=${mappedStatus}, DID=${didNumber}, caller=${callerNumber}`);

    if (!didNumber) {
      console.log("Bonvoice Notification: No DID number found, skipping.");
      return NextResponse.json({ success: true });
    }

    const didVariants  = phoneVariants(didNumber);
    const callerCore   = corePhone(callerNumber);

    // ── 1. Check for existing call log by callID ──────────────────────────────
    let callLog: any = null;
    if (callID) {
      callLog = await prisma.callLog.findFirst({
        where: { providerCallId: String(callID) },
      });
    }

    if (callLog) {
      // Update status only
      await prisma.callLog.update({
        where: { id: callLog.id },
        data: {
          status:     mappedStatus as any,
          answeredAt: mappedStatus === "ANSWERED" ? new Date() : undefined,
        },
      });
      console.log(`Bonvoice Notification: Updated existing call log ${callLog.id} → ${mappedStatus}`);
    } else {
      // ── 2. Find PhoneNumber by DID variants ───────────────────────────
      // Prefer sub-company's own number over parent-shared records
      const candidates = await prisma.phoneNumber.findMany({
        where: { number: { in: didVariants } },
        include: { company: { select: { parentCompanyId: true } } },
      });
      const phoneNumber = candidates.find((p: any) => p.company?.parentCompanyId)
                       ?? candidates[0]
                       ?? null;

      console.log(`Bonvoice Notification: DID [${didVariants.join(", ")}] → ${candidates.length} candidates, picked: ${phoneNumber ? `${phoneNumber.number} (company: ${phoneNumber.companyId})` : "NONE"}`);

      if (phoneNumber) {
        // ── 3. Optionally link to a Lead ──────────────────────────────────────
        let lead: any = null;
        if (callerCore && phoneNumber.companyId) {
          lead = await prisma.lead.findFirst({
            where: {
              companyId: phoneNumber.companyId,
              phone:     { contains: callerCore },
            },
          });
        }

        // ── 4. Create new RINGING call log ────────────────────────────────────
        const newLog = await prisma.callLog.create({
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
            startedAt:      StartTime
                              ? new Date(`${String(StartTime).replace(" ", "T")}+05:30`)
                              : new Date(),
            answeredAt:     mappedStatus === "ANSWERED" ? new Date() : undefined,
            provider:       "BONVOICE",
            providerStatus: mappedStatus,
            providerWebhook: data,
          },
        });
        console.log(`Bonvoice Notification: Created call log ${newLog.id} for company ${phoneNumber.companyId}, DID=${didNumber}`);
      } else {
        console.error("Bonvoice Notification: No PhoneNumber found for DID variants:", didVariants, "Full payload:", data);
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
