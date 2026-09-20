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

    // Fetch a dynamic fallback number for pending calls - MUST be OUTBOUND or BOTH direction, never inbound
    const activeFallbackPhone = await prisma.phoneNumber.findFirst({
      where: {
        companyId: companyId, // strictly main company only
        direction: { in: ["OUTBOUND", "BOTH"] },
        status: "ACTIVE",
      },
      select: { number: true, channels: true }
    });
    const fallbackNumber = activeFallbackPhone?.number || "Unknown";
    const fallbackChannels = activeFallbackPhone?.channels || 1;

    // Build a Set of currently-active outbound number strings for quick lookup
    const activeOutboundNumbers = new Set<string>();
    if (activeFallbackPhone?.number) activeOutboundNumbers.add(activeFallbackPhone.number);
    const allActiveOutboundPhones = await prisma.phoneNumber.findMany({
      where: { companyId: companyId, direction: { in: ["OUTBOUND", "BOTH"] }, status: "ACTIVE" },
      select: { number: true }
    });
    allActiveOutboundPhones.forEach((p: any) => activeOutboundNumbers.add(p.number));

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
        startedAt: true,
        lead: {
          select: { phone: true }
        }
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
      
      // Group by the actual calendar day in India (IST)
      const istFmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" });
      const key = istFmt.format(d); // "YYYY-MM-DD"
      
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
        // Calculate the NEXT calendar day in IST
        const nextDayMs = d.getTime() + 24 * 60 * 60 * 1000;
        const shortFmtOptions: Intl.DateTimeFormatOptions = { timeZone: "Asia/Kolkata", day: "2-digit", month: "short" };
        const shortFmt = new Intl.DateTimeFormat("en-GB", shortFmtOptions).format(d); // e.g. "12 Sep"
        const nextShortFmt = new Intl.DateTimeFormat("en-GB", shortFmtOptions).format(new Date(nextDayMs)); // e.g. "13 Sep"
        
        // Build Q1, Q2, Q3 schedule times in IST (UTC+5:30)
        // Extract the next day's date components in IST
        const nextDayStr = istFmt.format(new Date(nextDayMs)); // "YYYY-MM-DD"
        
        const q1Time = new Date(`${nextDayStr}T10:00:00+05:30`);
        const q2Time = new Date(`${nextDayStr}T15:00:00+05:30`);
        const q3Time = new Date(`${nextDayStr}T20:00:00+05:30`);

          // If the original number still exists in DB (phoneNumber relation not null), use it.
          // If it was deleted by admin (phoneNumber is null), show current active outbound number for pending waves.
          const numStillActive = call.phoneNumber !== null;
          const didToShow   = numStillActive ? (call.phoneNumber!.number) : fallbackNumber;
          const chToShow    = numStillActive ? (call.phoneNumber!.channels || fallbackChannels) : fallbackChannels;

        buckets[key] = {
          id: key,
          csvName: `${shortFmt} Failed Leads`,
          didNumber: didToShow,
          channels: chToShow,
          date: shortFmt, // E.g. "12 Sep"
          originalDateMs: d.getTime(),
          q1Time, q2Time, q3Time,
          q1: { label: "Wave 1", scheduled: `${nextShortFmt} 10 Am`, status: "Pending", failedLeads: [] },
          q2: { label: "Wave 2", scheduled: `${nextShortFmt} 3 Pm`, status: "Pending", failedLeads: [] },
          q3: { label: "Wave 3", scheduled: `${nextShortFmt} 8 Pm`, status: "Pending", failedLeads: [] },
        };
      } else {
        const currentDid = call.phoneNumber?.number;
        if (currentDid && buckets[key].didNumber !== currentDid) {
          // Both numbers still active but different — mark as multiple
          buckets[key].didNumber = "Multiple Numbers";
        } else if (!call.phoneNumber && buckets[key].didNumber !== fallbackNumber) {
          // Original number was deleted — pending wave should show current active outbound
          buckets[key].didNumber = fallbackNumber;
          buckets[key].channels  = fallbackChannels;
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

        const numStillActive2 = call.phoneNumber !== null;
        const didToShow2  = numStillActive2 ? (call.phoneNumber!.number) : fallbackNumber;
        const chToShow2   = numStillActive2 ? (call.phoneNumber!.channels || fallbackChannels) : fallbackChannels;

        buckets[key].q1.failedLeads.push({
           id: leadId,
           name: leadName,
           phone: leadPhone,
           didNumber: didToShow2,
           channels: chToShow2,
           isCompleted: false,
           originalCallType
        });
      }
    }

    const PENDING_STATUSES = ["PENDING", "RINGING", "IN-PROGRESS", "QUEUED", "DISPATCHING", "QUEUED_AT_PROVIDER", "ANSWERED"];

    // Now refine the lists based on actual Reactivation Q1/Q2/Q3 performance
    for (const key of Object.keys(buckets)) {
      const b = buckets[key];

      // Build the stable correlationIds that the cron now uses.
      // Format: reactivation-{YYYY-MM-DD}-{companyId[0..7]}-{didLast6}-q1|q2|q3
      const compShort = companyId.replace(/-/g, "").slice(0, 8);
      const correlationPrefix = `reactivation-${key}-${compShort}-`;

      // A wave is "Running" if any of its logs are still PENDING/RINGING
      const q1Running = reactivationLogs.some(
        l => l.correlationId?.startsWith(correlationPrefix) && l.correlationId?.endsWith("-q1") && PENDING_STATUSES.includes(l.status?.toUpperCase() || "")
      );
      const q2Running = reactivationLogs.some(
        l => l.correlationId?.startsWith(correlationPrefix) && l.correlationId?.endsWith("-q2") && PENDING_STATUSES.includes(l.status?.toUpperCase() || "")
      );
      const q3Running = reactivationLogs.some(
        l => l.correlationId?.startsWith(correlationPrefix) && l.correlationId?.endsWith("-q3") && PENDING_STATUSES.includes(l.status?.toUpperCase() || "")
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
        (l.correlationId?.startsWith(correlationPrefix) && l.correlationId?.endsWith("-q1")) || 
        (b.q1.failedLeads.some((fl: any) => fl.id === l.leadId) && matchLegacy(l, "-q1", b.q1Time))
      );
      const hasQ2Logs = reactivationLogs.some(l => 
        (l.correlationId?.startsWith(correlationPrefix) && l.correlationId?.endsWith("-q2")) || 
        (b.q1.failedLeads.some((fl: any) => fl.id === l.leadId) && matchLegacy(l, "-q2", b.q2Time))
      );
      const hasQ3Logs = reactivationLogs.some(l => 
        (l.correlationId?.startsWith(correlationPrefix) && l.correlationId?.endsWith("-q3")) || 
        (b.q1.failedLeads.some((fl: any) => fl.id === l.leadId) && matchLegacy(l, "-q3", b.q3Time))
      );

      const nowMs = Date.now();
      // If a wave is past its scheduled time by more than 4 hours and has no logs, consider it missed/completed
      const isMissed = (time: Date) => nowMs > time.getTime() + 4 * 60 * 60 * 1000;

      b.q1.status = q1Running ? "Running" : (hasQ1Logs || isMissed(b.q1Time) ? "Completed" : "Pending");
      b.q2.status = q2Running ? "Running" : (hasQ2Logs || isMissed(b.q2Time) ? "Completed" : "Pending");
      b.q3.status = q3Running ? "Running" : (hasQ3Logs || isMissed(b.q3Time) ? "Completed" : "Pending");

      // Build per-lead outcome lists for each wave
      const q1FinalList: any[] = [];
      const q2FinalList: any[] = [];
      const q3FinalList: any[] = [];

      for (const lead of b.q1.failedLeads) {
        const leadLogs = reactivationLogs.filter(l => l.leadId === lead.id || (l.lead?.phone && l.lead.phone === lead.phone));

        // For finding specific logs, try strict match first, fallback to legacy match
        const q1Log = leadLogs.find(l => l.correlationId?.startsWith(correlationPrefix) && l.correlationId?.endsWith("-q1")) || leadLogs.find(l => matchLegacy(l, "-q1", b.q1Time));
        const q2Log = leadLogs.find(l => l.correlationId?.startsWith(correlationPrefix) && l.correlationId?.endsWith("-q2")) || leadLogs.find(l => matchLegacy(l, "-q2", b.q2Time));
        const q3Log = leadLogs.find(l => l.correlationId?.startsWith(correlationPrefix) && l.correlationId?.endsWith("-q3")) || leadLogs.find(l => matchLegacy(l, "-q3", b.q3Time));

        const completedInQ1 = q1Log?.status === "COMPLETED" && (q1Log.durationSeconds || 0) > 0;
        const completedInQ2 = q2Log?.status === "COMPLETED" && (q2Log.durationSeconds || 0) > 0;
        const completedInQ3 = q3Log?.status === "COMPLETED" && (q3Log.durationSeconds || 0) > 0;

        // Calculate Q1 status
        const isPendingInQ1 = (!q1Log && !isMissed(b.q1Time)) || (q1Log && PENDING_STATUSES.includes(q1Log.status?.toUpperCase() || ""));
        const failedInQ1 = !isPendingInQ1 && !completedInQ1;

        // Wave 1 always shows all original leads
        q1FinalList.push({ ...lead, isCompleted: completedInQ1, isFailed: failedInQ1, isAttempted: !!q1Log, status: q1Log?.status });

        // Real-time transfer: Lead propagates to Q2 instantly if Q1 finished but failed (or if Q1 was completely missed)
        if (failedInQ1) {
          const isPendingInQ2 = (!q2Log && !isMissed(b.q2Time)) || (q2Log && PENDING_STATUSES.includes(q2Log.status?.toUpperCase() || ""));
          const failedInQ2 = !isPendingInQ2 && !completedInQ2;

          q2FinalList.push({ ...lead, isCompleted: completedInQ2, isFailed: failedInQ2, isAttempted: !!q2Log, status: q2Log?.status });

          // Real-time transfer: Lead propagates to Q3 instantly if Q2 finished but failed (or if Q2 was completely missed)
          if (failedInQ2) {
            const isPendingInQ3 = (!q3Log && !isMissed(b.q3Time)) || (q3Log && PENDING_STATUSES.includes(q3Log.status?.toUpperCase() || ""));
            const failedInQ3 = !isPendingInQ3 && !completedInQ3;

            q3FinalList.push({ ...lead, isCompleted: completedInQ3, isFailed: failedInQ3, isAttempted: !!q3Log, status: q3Log?.status });
          }
        }
      }

      // Sort each wave: successful calls first, ringing/active second, failed third, unattempted last
      const getLeadScore = (l: any) => {
        if (l.isCompleted) return 4;
        if (l.isAttempted && !l.isFailed) return 3; // Ringing/Active
        if (l.isFailed) return 2;
        return 1; // Unattempted
      };
      const sortWave = (list: any[]) => list.sort((a, b) => getLeadScore(b) - getLeadScore(a));

      // Override running status if there are unattempted leads AND we haven't missed the window yet
      if (b.q1.status !== "Running" && q1FinalList.some(l => !l.isAttempted) && !isMissed(b.q1Time) && Date.now() >= b.q1Time.getTime()) {
        b.q1.status = "Running";
      }
      if (b.q2.status !== "Running" && q2FinalList.some(l => !l.isAttempted) && !isMissed(b.q2Time) && Date.now() >= b.q2Time.getTime()) {
        b.q2.status = "Running";
      }
      if (b.q3.status !== "Running" && q3FinalList.some(l => !l.isAttempted) && !isMissed(b.q3Time) && Date.now() >= b.q3Time.getTime()) {
        b.q3.status = "Running";
      }

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

      // STRICT WAVE DEPENDENCY: A wave cannot be Completed/Running if the previous wave is not Completed
      if (b.q1.status === "Pending" || b.q1.status === "Running") {
        b.q2.status = "Pending";
        b.q3.status = "Pending";
      } else if (b.q2.status === "Pending" || b.q2.status === "Running") {
        b.q3.status = "Pending";
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
