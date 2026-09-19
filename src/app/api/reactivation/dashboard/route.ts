import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "propnex_secret_jwt_key_2026_key";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.sub || decoded.id;

    const member = await (prisma as any).companyMember.findFirst({
      where: { userId, status: "ACTIVE" }
    });

    if (!member?.companyId) {
      return NextResponse.json({ data: [] });
    }

    const companyId = member.companyId;

    const subCompanies = await prisma.company.findMany({
      where: { parentCompanyId: companyId },
      select: { id: true }
    });
    const companyIdsToQuery = [companyId, ...subCompanies.map((c: any) => c.id)];

    // Fetch a dynamic fallback number for pending calls in case the original DID was removed or not recorded
    const activeFallbackPhone = await prisma.phoneNumber.findFirst({
      where: { companyId: { in: companyIdsToQuery } },
      select: { number: true, channels: true }
    });
    const fallbackNumber = activeFallbackPhone?.number || "Unknown";
    const fallbackChannels = activeFallbackPhone?.channels || 1;

    // Fetch all initial FAILED/MISSED calls to find the base "Failed Leads" pool
    // We only want original outbound calls, NOT reactivation calls
    const failedCalls = await prisma.callLog.findMany({
      where: {
        companyId: { in: companyIdsToQuery },
        direction: "OUTBOUND",
        OR: [
          { status: { in: ["FAILED", "MISSED", "BUSY", "NO_ANSWER", "CANCELLED"] } },
          { durationSeconds: 0 },
        ],
        NOT: {
          AND: [
            { correlationId: { isSet: true } },
            { correlationId: { startsWith: "reactivation-" } }
          ]
        }
      },
      include: {
        lead: true,
        phoneNumber: true,
      },
      orderBy: {
        startedAt: "asc"
      }
    });

    // Also fetch all reactivation CallLogs to track Q1/Q2/Q3 progress
    // We need these to know if a lead successfully answered during Q1, Q2, or Q3
    const reactivationLogs = await prisma.callLog.findMany({
      where: {
        companyId: { in: companyIdsToQuery },
        direction: "OUTBOUND",
        correlationId: { startsWith: "reactivation-" }
      },
      select: {
        leadId: true,
        status: true,
        correlationId: true,
        durationSeconds: true,
        startedAt: true
      }
    });

    const activeCampaignIds = new Set<string>();
    reactivationLogs.forEach(log => {
      if (log.status === "PENDING" || log.status === "RINGING") {
        if (log.correlationId) activeCampaignIds.add(log.correlationId);
      }
    });

    const buckets: Record<string, any> = {};
    let currentKey = "";
    const seenPhones = new Set<string>();

    for (const call of failedCalls) {
      const d = call.startedAt;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      
      // Per-day deduplication: Reset seenPhones when we enter a new day
      if (key !== currentKey) {
        currentKey = key;
        seenPhones.clear();
      }

      let fallbackCustomerNumber = "";
      if (call.providerWebhook && typeof call.providerWebhook === 'object') {
         const wh: any = call.providerWebhook;
         fallbackCustomerNumber =
           wh.DestinationNumber || wh.destination_number || wh.destinationNumber ||
           wh.caller || wh.to_number || wh.to ||
           wh.customer_number || wh.customerNumber || "";
         
         const callIdRaw = wh.callID || wh.callId || wh.call_id || wh.uuid;
         if (!fallbackCustomerNumber && callIdRaw && typeof callIdRaw === 'string') {
           const parts = callIdRaw.split('-');
           if (parts.length >= 3) fallbackCustomerNumber = parts[2];
         }
      }
      if (!fallbackCustomerNumber && call.providerRequest && typeof call.providerRequest === 'object') {
         const req: any = call.providerRequest;
         fallbackCustomerNumber = req.to || req.to_number || req.DestinationNumber || req.customerNumber || "";
      }
      if (!fallbackCustomerNumber && call.providerResponse && typeof call.providerResponse === 'object') {
         const res: any = call.providerResponse;
         fallbackCustomerNumber = res.to || res.to_number || res.DestinationNumber || res.customerNumber || "";
      }

      const leadPhone = call.lead?.phone || fallbackCustomerNumber;
      if (!leadPhone) continue; // Skip if no phone number available
      
      // Deduplication per day: only add a number to the reactivation pipeline once per day
      if (seenPhones.has(leadPhone)) continue;
      seenPhones.add(leadPhone);
      
      if (!buckets[key]) {
        const nextDay = new Date(d);
        nextDay.setDate(nextDay.getDate() + 1);
        const shortFmt = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" }).format(d); // e.g. "12 Sep"
        const nextShortFmt = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" }).format(nextDay); // e.g. "13 Sep"
        
        const yyyy = nextDay.getFullYear();
        const mm = String(nextDay.getMonth() + 1).padStart(2, "0");
        const dd = String(nextDay.getDate()).padStart(2, "0");
        const nextDayStr = `${yyyy}-${mm}-${dd}`;

        const q1Time = new Date(`${nextDayStr}T10:00:00+05:30`);
        const q2Time = new Date(`${nextDayStr}T15:00:00+05:30`);
        const q3Time = new Date(`${nextDayStr}T20:00:00+05:30`);

        buckets[key] = {
          id: key,
          csvName: `${shortFmt} Failed Leads`,
          didNumber: (call as any).historicalDidString || call.phoneNumber?.number || fallbackNumber,
          channels: (call as any).historicalChannels || call.phoneNumber?.channels || fallbackChannels,
          date: shortFmt, // E.g. "12 Sep"
          originalDateMs: d.getTime(),
          q1Time, q2Time, q3Time,
          q1: { label: "Wave 1", scheduled: `${nextShortFmt} 10 Am`, status: "Pending", failedLeads: [] },
          q2: { label: "Wave 2", scheduled: `${nextShortFmt} 3 Pm`, status: "Pending", failedLeads: [] },
          q3: { label: "Wave 3", scheduled: `${nextShortFmt} 8 Pm`, status: "Pending", failedLeads: [] },
        };
      } else {
        const currentDid = (call as any).historicalDidString || call.phoneNumber?.number;
        if (currentDid && buckets[key].didNumber !== currentDid) {
           buckets[key].didNumber = "Multiple Numbers";
        }
      }
      
      const leadId = call.leadId || `manual-${leadPhone}`;
      if (!buckets[key].q1.failedLeads.find((l: any) => l.phone === leadPhone)) {
        
        let leadName = "Unknown";
        if (call.lead) {
          if (call.lead.firstName || call.lead.lastName) {
             leadName = `${call.lead.firstName || ""} ${call.lead.lastName || ""}`.trim();
          } else if ((call.lead as any).name) {
             leadName = (call.lead as any).name;
          } else if (call.lead.customFields) {
             try {
               const custom = typeof call.lead.customFields === 'string' ? JSON.parse(call.lead.customFields) : call.lead.customFields;
               if (custom.Name || custom.name) leadName = custom.Name || custom.name;
             } catch(e) {}
          }
        }

        const originalCallType = call.campaignId || (call.correlationId && call.correlationId.startsWith("camp-")) 
          ? "Campaign" 
          : "Internal";

        buckets[key].q1.failedLeads.push({
           id: leadId,
           name: leadName,
           phone: leadPhone,
           didNumber: (call as any).historicalDidString || call.phoneNumber?.number || fallbackNumber,
           channels: (call as any).historicalChannels || call.phoneNumber?.channels || fallbackChannels,
           isCompleted: false,
           originalCallType
        });
      }
    }

    // Now refine the lists based on actual Reactivation Q1/Q2/Q3 performance
    for (const key of Object.keys(buckets)) {
      const b = buckets[key];

      // Build the stable correlationIds that the cron now uses.
      // Format: reactivation-{YYYY-MM-DD}-{companyId[0..7]}-{didLast6}-q1|q2|q3
      const compShort = companyId.replace(/-/g, "").slice(0, 8);
      const didDigits = (b.didNumber || "").replace(/\D/g, "").slice(-6);
      const q1CorrelationId = `reactivation-${key}-${compShort}-${didDigits}-q1`;
      const q2CorrelationId = `reactivation-${key}-${compShort}-${didDigits}-q2`;
      const q3CorrelationId = `reactivation-${key}-${compShort}-${didDigits}-q3`;

      // A wave is "Running" if any of its logs are still PENDING/RINGING
      const q1Running = reactivationLogs.some(
        l => l.correlationId === q1CorrelationId && (l.status === "PENDING" || l.status === "RINGING")
      );
      const q2Running = reactivationLogs.some(
        l => l.correlationId === q2CorrelationId && (l.status === "PENDING" || l.status === "RINGING")
      );
      const q3Running = reactivationLogs.some(
        l => l.correlationId === q3CorrelationId && (l.status === "PENDING" || l.status === "RINGING")
      );

      // We check for the strict new correlationId, OR a legacy correlationId whose startedAt date matches the scheduled wave date.
      const matchLegacy = (log: any, suffix: string, expectedTime: Date) => {
        if (!log.correlationId?.endsWith(suffix)) return false;
        // If it's the new format, don't use legacy match
        if (log.correlationId?.match(/reactivation-\d{4}-\d{2}-\d{2}-/)) return false;
        // For legacy, check if the log started on or after the expected day (ignoring exact hours)
        const logDate = new Date(log.startedAt).toISOString().split('T')[0];
        const expectedDate = expectedTime.toISOString().split('T')[0];
        return logDate === expectedDate;
      };

      const hasQ1Logs = reactivationLogs.some(l => 
        l.correlationId === q1CorrelationId || 
        (b.q1.failedLeads.some((fl: any) => fl.id === l.leadId) && matchLegacy(l, "-q1", b.q1Time))
      );
      const hasQ2Logs = reactivationLogs.some(l => 
        l.correlationId === q2CorrelationId || 
        (b.q1.failedLeads.some((fl: any) => fl.id === l.leadId) && matchLegacy(l, "-q2", b.q2Time))
      );
      const hasQ3Logs = reactivationLogs.some(l => 
        l.correlationId === q3CorrelationId || 
        (b.q1.failedLeads.some((fl: any) => fl.id === l.leadId) && matchLegacy(l, "-q3", b.q3Time))
      );

      const nowMs = Date.now();
      // If a wave is past its scheduled time by more than 1 hour and has no logs, consider it missed/completed
      const isMissed = (time: Date) => nowMs > time.getTime() + 1 * 60 * 60 * 1000;

      b.q1.status = q1Running ? "Running" : (hasQ1Logs || isMissed(b.q1Time) ? "Completed" : "Pending");
      b.q2.status = q2Running ? "Running" : (hasQ2Logs || isMissed(b.q2Time) ? "Completed" : "Pending");
      b.q3.status = q3Running ? "Running" : (hasQ3Logs || isMissed(b.q3Time) ? "Completed" : "Pending");

      // Build per-lead outcome lists for each wave
      const q1FinalList: any[] = [];
      const q2FinalList: any[] = [];
      const q3FinalList: any[] = [];

      for (const lead of b.q1.failedLeads) {
        const leadLogs = reactivationLogs.filter(l => l.leadId === lead.id);

        // For finding specific logs, try strict match first, fallback to legacy match
        const q1Log = leadLogs.find(l => l.correlationId === q1CorrelationId) || leadLogs.find(l => matchLegacy(l, "-q1", b.q1Time));
        const q2Log = leadLogs.find(l => l.correlationId === q2CorrelationId) || leadLogs.find(l => matchLegacy(l, "-q2", b.q2Time));
        const q3Log = leadLogs.find(l => l.correlationId === q3CorrelationId) || leadLogs.find(l => matchLegacy(l, "-q3", b.q3Time));

        const completedInQ1 = q1Log?.status === "COMPLETED" && (q1Log.durationSeconds || 0) > 0;
        const completedInQ2 = q2Log?.status === "COMPLETED" && (q2Log.durationSeconds || 0) > 0;
        const completedInQ3 = q3Log?.status === "COMPLETED" && (q3Log.durationSeconds || 0) > 0;

        // Wave 1 always shows all original leads
        q1FinalList.push({ ...lead, isCompleted: completedInQ1 });

        // Real-time transfer: Lead propagates to Q2 instantly if Q1 finished but failed
        const isPendingInQ1 = !q1Log || ["PENDING", "RINGING", "IN-PROGRESS", "QUEUED"].includes(q1Log.status?.toUpperCase() || "PENDING");
        const failedInQ1 = !isPendingInQ1 && !completedInQ1;

        if (failedInQ1) {
          q2FinalList.push({ ...lead, isCompleted: completedInQ2 });

          // Real-time transfer: Lead propagates to Q3 instantly if Q2 finished but failed
          const isPendingInQ2 = !q2Log || ["PENDING", "RINGING", "IN-PROGRESS", "QUEUED"].includes(q2Log.status?.toUpperCase() || "PENDING");
          const failedInQ2 = !isPendingInQ2 && !completedInQ2;

          if (failedInQ2) {
            q3FinalList.push({ ...lead, isCompleted: completedInQ3 });
          }
        }
      }

      // Sort each wave: successful calls first, failed/pending last
      const sortWave = (list: any[]) =>
        list.sort((a, b) => (b.isCompleted ? 1 : 0) - (a.isCompleted ? 1 : 0));

      b.q1.failedLeads = sortWave(q1FinalList);
      b.q2.failedLeads = sortWave(q2FinalList);
      b.q3.failedLeads = sortWave(q3FinalList);

      // If a wave has no pending leads after filtering, auto-complete it
      // (only when the previous wave is already Completed)
      if (b.q1.status === "Completed" && q2FinalList.length === 0) {
        b.q2.status = "Completed";
      }
      if (b.q2.status === "Completed" && q3FinalList.length === 0) {
        b.q3.status = "Completed";
      }

      // Determine overall campaign status for the sidebar badge
      // Completed = all 3 waves done (or auto-completed because no failed leads remained)
      b.overallStatus =
        b.q3.status === "Completed"
          ? "Completed"
          : b.q1.status === "Pending"
          ? "Pending Q1"
          : b.q2.status === "Pending"
          ? "Pending Q2"
          : b.q3.status === "Pending"
          ? "Pending Q3"
          : "Running";
    }


    const data = Object.values(buckets).sort((a: any, b: any) => b.originalDateMs - a.originalDateMs);

    // Clean up internal dates before sending to client
    for (const b of data) {
      delete b.q1Time;
      delete b.q2Time;
      delete b.q3Time;
      delete b.originalDateMs;
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Failed to fetch reactivation dashboard data:", error);
    return NextResponse.json({ message: "Internal server error", data: [] }, { status: 500 });
  }
}
