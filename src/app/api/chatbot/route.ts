import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { GEMINI_API_KEYS } from "@/lib/gemini-keys";
import { CHATBOT_RULEBOOK } from "@/lib/rulebook";

export const dynamic = "force-dynamic";

// ── Cache ──────────────────────────────────────────────────────────────────
const contextCache = new Map<string, { context: string; ts: number }>();
const CACHE_TTL_MS = 45_000; // 45 seconds

function getCachedContext(id: string): string | null {
  const hit = contextCache.get(id);
  if (hit && Date.now() - hit.ts < CACHE_TTL_MS) return hit.context;
  return null;
}
function setCachedContext(id: string, ctx: string) {
  contextCache.set(id, { context: ctx, ts: Date.now() });
}

// ── Helpers ────────────────────────────────────────────────────────────────
const toMinSec = (secs: number) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m} min ${s} sec` : `${s} sec`;
};

const dateFmt = (d: Date | string | null) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Unknown";

const timeFmt = (d: Date | string | null) =>
  d ? new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "Unknown";

// Group array by key
function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = key(item);
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

// ── Gemini call with key rotation + retry on 429 ──────────────────────────
async function callGemini(payload: object, model = "gemini-flash-lite-latest"): Promise<Response> {
  let lastErr: any = null;
  // Try all keys in order; on 429 rotate immediately
  for (let i = 0; i < GEMINI_API_KEYS.length; i++) {
    const key = GEMINI_API_KEYS[i];
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${key}`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.status === 429 || res.status === 503) {
        lastErr = `Key ${i + 1} rate limited (${res.status})`;
        continue; // try next key
      }
      return res; // success or non-rate-limit error
    } catch (e) {
      lastErr = e;
      continue;
    }
  }
  throw new Error(`All Gemini keys exhausted. Last error: ${lastErr}`);
}

// ── Main POST ─────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const { messages, companyId, firstName, user } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages array" }, { status: 400 });
    }

    const userName = firstName || "there";

    const systemRules = `SYSTEM RULES (obey on every response, no exceptions):
1. Address the user naturally: "Yes ${userName}", "Of course ${userName}", "Sure ${userName}". NEVER start with "Hello" or "Hey".
2. NEVER use markdown: no **, no #, no _, no bullet dashes, no asterisks. Plain text only.
3. Be HIGHLY CONCISE — answer only what was asked. Never add unsolicited information.
4. You are Task Desk — the smart personal assistant for the Propnex AI platform.
5. Use EXACT numbers from the LIVE DATA context below. Never say "I don't know" if data is available.
6. For phone numbers always show format: Number, Direction, Channels.
7. For durations always use "X min Y sec" format.
8. For recording URLs, give the full URL exactly as stored. Format as: Recording URL: <url>
9. If asked about Lead Reactivation, explain: the system runs at 11:50 PM IST daily, extracts all failed calls from the previous day, and schedules 3 retry waves — Wave 1 (Q1) at 10 AM, Wave 2 (Q2) at 3 PM, Wave 3 (Q3) at 8 PM the next day. Each wave only calls leads not yet answered.
10. Outbound has 3 types: (a) Campaign — automated CSV-based calls to many leads using a chosen AI agent; (b) Internal — manual one-to-one calls made from within the dashboard; (c) Lead Reactivation — automated retry calls for failed/unanswered leads from previous days.
11. If recording URL is requested, provide the EXACT URL from the RECORDING URLS section below.
12. If the user asks for recordings of a date range, list ALL recordings from that period with their URLs.
13. If asked about "infra cost" notification, explain it from the INFRA COST block.
14. ALWAYS answer from data. If a field is not in context, say "I cannot see that specific detail in the available data."`;

    // ── Try cache ──────────────────────────────────────────────────────────
    let realTimeContext = `${systemRules}\n\nUser: ${userName}\nCompany: Not connected.`;

    if (companyId) {
      const cached = getCachedContext(companyId);
      if (cached) {
        realTimeContext = `${systemRules}\n\n${cached}`;
      } else {
        // ── Full DB fetch ─────────────────────────────────────────────────
        const [
          company, subcompanies, billingQuotes, creditUsages,
          largestDeductions, largestPositiveDeductions, oldestBillingQuote,
          agents, campaigns, infraCost, campaignExecutions
        ] = await Promise.all([
          prisma.company.findUnique({
            where: { id: companyId },
            include: { creditBalance: true, phoneNumbers: true, outboundCampaigns: true, setupConfig: true }
          }) as any,
          prisma.company.findMany({
            where: { parentCompanyId: companyId },
            include: { creditBalance: true, phoneNumbers: true }
          }) as any,
          prisma.billingQuote.findMany({ where: { companyId, status: "PURCHASED" }, orderBy: { purchasedAt: "desc" }, take: 5 }) as any,
          prisma.creditUsage.findMany({ where: { companyId }, orderBy: { createdAt: "desc" }, take: 500 }) as any,
          prisma.creditUsage.findMany({ where: { companyId }, orderBy: { amount: "asc" }, take: 50 }) as any,
          prisma.creditUsage.findMany({ where: { companyId }, orderBy: { amount: "desc" }, take: 50 }) as any,
          prisma.billingQuote.findMany({ where: { companyId, status: "PURCHASED" }, orderBy: { purchasedAt: "asc" }, take: 1 }) as any,
          prisma.aiAgent.findMany({ where: { companyId } }) as any,
          prisma.campaign.findMany({ where: { companyId } }) as any,
          prisma.infraCostNotification.findFirst({
            where: { OR: [{ companyId }, { subCompanyId: companyId }] },
            orderBy: { createdAt: "desc" }
          }) as any,
          prisma.campaignExecution.findMany({ where: { companyId } }) as any,
        ]);

        // ── Optimized full call logs fetch (NO lead JOIN to prevent timeout) ────────
        const rawCallLogs = await prisma.callLog.findMany({
          where: { companyId },
          select: {
            id: true,
            direction: true,
            status: true,
            durationSeconds: true,
            cost: true,
            creditsUsed: true,
            startedAt: true,
            phoneNumberId: true,
            recordingUrl: true,
            historicalDidString: true,
            campaignId: true,
            isRetry: true,
            retryNumber: true,
            disconnectReason: true,
            leadId: true,
          },
          orderBy: { startedAt: "desc" },
          take: 2000, // Reduced from 10000 to prevent Vercel 502 OOM/Timeout
        });

        const subCompanyIds = subcompanies.map((s: any) => s.id);
        const subCallLogs = subCompanyIds.length > 0
          ? await prisma.callLog.findMany({
              where: { companyId: { in: subCompanyIds } },
              select: {
                id: true, companyId: true, direction: true, status: true,
                durationSeconds: true, cost: true, creditsUsed: true,
                startedAt: true, phoneNumberId: true, recordingUrl: true,
                campaignId: true, isRetry: true, leadId: true,
              },
              take: 1000, // Reduced from 5000 to prevent Vercel 502 OOM/Timeout
            })
          : [];

        if (company) {
          const allCalls = [...rawCallLogs, ...subCallLogs];
          const inboundCalls  = allCalls.filter((c: any) => c.direction === "INBOUND");
          const outboundCalls = allCalls.filter((c: any) => c.direction === "OUTBOUND");
          const reactivationCalls = allCalls.filter((c: any) => c.isRetry === true);

          // ── Per-customer stats ────────────────────────────────────────
          const customerCallMap: Record<string, { leadId: string; inbound: number; outbound: number; totalDuration: number; lastCall: string; recordings: string[] }> = {};

          for (const c of allCalls as any[]) {
            const lid = c.leadId;
            if (!lid) continue;
            if (!customerCallMap[lid]) {
              customerCallMap[lid] = {
                leadId: lid,
                inbound: 0,
                outbound: 0,
                totalDuration: 0,
                lastCall: c.startedAt,
                recordings: [],
              };
            }
            const entry = customerCallMap[lid];
            if (c.direction === "INBOUND") entry.inbound++;
            else entry.outbound++;
            entry.totalDuration += c.durationSeconds || 0;
            if (c.recordingUrl) entry.recordings.push(c.recordingUrl);
            if (new Date(c.startedAt) > new Date(entry.lastCall)) entry.lastCall = c.startedAt;
          }

          const customerList = Object.values(customerCallMap);
          const topByTotal   = [...customerList].sort((a, b) => (b.inbound + b.outbound) - (a.inbound + a.outbound)).slice(0, 20);
          const topInbound   = [...customerList].sort((a, b) => b.inbound  - a.inbound).slice(0, 10);
          const topOutbound  = [...customerList].sort((a, b) => b.outbound - a.outbound).slice(0, 10);

          // Get unique top lead IDs to fetch details for
          const topLeadIds = new Set([...topByTotal.slice(0, 50), ...topInbound, ...topOutbound].map(c => c.leadId));
          const topLeads = await prisma.lead.findMany({
            where: { id: { in: Array.from(topLeadIds) } },
            select: { id: true, phone: true, firstName: true, lastName: true }
          });
          const leadDataMap = new Map(topLeads.map(l => [l.id, l]));

          const enrichCustomer = (c: any) => {
            const l = leadDataMap.get(c.leadId) as any;
            return { ...c, phone: l?.phone || "Unknown", name: `${l?.firstName || ""} ${l?.lastName || ""}`.trim() || "Unknown" };
          };

          const topByTotalEnriched = topByTotal.slice(0, 50).map(enrichCustomer);
          const topInboundEnriched = topInbound.map(enrichCustomer);
          const topOutboundEnriched = topOutbound.map(enrichCustomer);
          
          const absoluteHighestCaller = topByTotalEnriched.length > 0 ? topByTotalEnriched[0] : null;

          // ── Per-date grouping (last 60 days) ─────────────────────────
          const dateGroups = groupBy(allCalls as any[], (c: any) => dateFmt(c.startedAt));
          const dateKeys = Object.keys(dateGroups).slice(0, 60);
          const perDayLines = dateKeys.map(d => {
            const dayCalls = dateGroups[d];
            const dayIn   = dayCalls.filter((c: any) => c.direction === "INBOUND").length;
            const dayOut  = dayCalls.filter((c: any) => c.direction === "OUTBOUND").length;
            const dayDur  = dayCalls.reduce((s: number, c: any) => s + (c.durationSeconds || 0), 0);
            const dayFail = dayCalls.filter((c: any) => c.status === "FAILED").length;
            const dayCred = dayCalls.reduce((s: number, c: any) => s + (c.creditsUsed || 0), 0);
            return `${d}: Total ${dayCalls.length} (In: ${dayIn}, Out: ${dayOut}), Failed: ${dayFail}, Duration: ${toMinSec(dayDur)}, Credits Used: ${dayCred.toFixed(2)}`;
          });

          // ── Per-date customer breakdown (last 14 days) ─────────────
          const perDayCustomerLines: string[] = [];
          const last14Days = dateKeys.slice(0, 14);
          
          // Need to fetch leads for these days
          const recentDayLeadIds = new Set<string>();
          for (const d of last14Days) {
            dateGroups[d].forEach((c: any) => { if (c.leadId) recentDayLeadIds.add(c.leadId); });
          }
          const recentDayLeads = await prisma.lead.findMany({
            where: { id: { in: Array.from(recentDayLeadIds) } },
            select: { id: true, phone: true }
          });
          const recentLeadPhoneMap = new Map(recentDayLeads.map(l => [l.id, l.phone]));

          for (const d of last14Days) {
            const dayCalls = dateGroups[d] as any[];
            const phoneMap: Record<string, number> = {};
            for (const c of dayCalls) {
              const ph = recentLeadPhoneMap.get(c.leadId);
              if (ph) phoneMap[ph] = (phoneMap[ph] || 0) + 1;
            }
            const topPhones = Object.entries(phoneMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
            if (topPhones.length > 0) {
              perDayCustomerLines.push(`${d} — Top callers: ${topPhones.map(([p, n]) => `${p}(${n})`).join(", ")}`);
            }
          }

          // ── Recording URLs (recent 50 calls with recordings) ────────
          const callsWithRecordings = (allCalls as any[]).filter(c => c.recordingUrl).slice(0, 50);
          
          const recLeadIds = Array.from(new Set(callsWithRecordings.map(c => c.leadId).filter(Boolean)));
          const recLeads = await prisma.lead.findMany({ where: { id: { in: recLeadIds } }, select: { id: true, phone: true } });
          const recLeadMap = new Map(recLeads.map(l => [l.id, l.phone]));

          const recordingLines = callsWithRecordings.map((c: any) =>
            `${timeFmt(c.startedAt)} | ${c.direction} | Customer: ${recLeadMap.get(c.leadId) || "Unknown"} | DID: ${c.historicalDidString || "Unknown"} | Duration: ${toMinSec(c.durationSeconds)} | Recording URL: ${c.recordingUrl}`
          );

          // ── Reactivation calls history ────────────────────────────
          const reactByDate = groupBy(reactivationCalls as any[], (c: any) => dateFmt(c.startedAt));
          const reactLines = Object.entries(reactByDate).slice(0, 30).map(([d, calls]: [string, any[]]) => {
            const succeeded = calls.filter(c => c.status === "COMPLETED" || c.status === "ANSWERED").length;
            const failed    = calls.filter(c => c.status === "FAILED" || c.status === "NO_ANSWER").length;
            return `${d}: ${calls.length} reactivation calls — Answered: ${succeeded}, Failed: ${failed}`;
          });

          // ── Notable calls ─────────────────────────────────────────
          const maxInDur  = inboundCalls.length  > 0 ? Math.max(...(inboundCalls  as any[]).map((c: any) => c.durationSeconds || 0)) : 0;
          const maxOutDur = outboundCalls.length > 0 ? Math.max(...(outboundCalls as any[]).map((c: any) => c.durationSeconds || 0)) : 0;
          const longestIn  = (inboundCalls  as any[]).find((c: any) => c.durationSeconds === maxInDur && c.durationSeconds > 0);
          const longestOut = (outboundCalls as any[]).find((c: any) => c.durationSeconds === maxOutDur && c.durationSeconds > 0);

          const sortedByCost = [...rawCallLogs].sort((a: any, b: any) => (b.creditsUsed || 0) - (a.creditsUsed || 0));
          const top10Calls = sortedByCost.slice(0, 10);
          const recent20 = [...rawCallLogs].slice(0, 20); // already sorted by startedAt desc

          const notableCallIds = new Set([...top10Calls, ...recent20, longestIn, longestOut].filter(Boolean).map(c => c.leadId).filter(Boolean));
          const notableLeadsData = await prisma.lead.findMany({ where: { id: { in: Array.from(notableCallIds) } }, select: { id: true, phone: true, firstName: true, lastName: true } });
          const notableLeadMap = new Map(notableLeadsData.map(l => [l.id, l]));

          const formatCall = (c: any) => {
            if (!c) return "None";
            const l = notableLeadMap.get(c.leadId) as any;
            return `Customer: ${l?.phone || "Unknown"} (${l?.firstName || ""} ${l?.lastName || ""}).trim() | DID: ${c.historicalDidString || "N/A"} | Duration: ${toMinSec(c.durationSeconds)} | Credits: ${c.creditsUsed || 0} | Date: ${dateFmt(c.startedAt)}${c.recordingUrl ? " | Recording: " + c.recordingUrl : ""}`;
          };

          const formatCallShort = (c: any) => {
            if (!c) return "";
            const l = notableLeadMap.get(c.leadId) as any;
            return `${dateFmt(c.startedAt)} | ${c.direction} | ${l?.phone || "Unknown"} | ${toMinSec(c.durationSeconds)} | ${c.status}${c.recordingUrl ? " | REC: " + c.recordingUrl : ""}`;
          };

          // ── Credits ──────────────────────────────────────────────
          const mainCreditsRemaining = company.creditBalance?.creditsRemaining || 0;
          const mainCreditsUsed      = company.creditBalance?.creditsUsed || 0;
          const subCreditsRemaining  = subcompanies.reduce((s: number, sc: any) => s + (sc.creditBalance?.creditsRemaining || 0), 0);
          const subCreditsUsed       = subcompanies.reduce((s: number, sc: any) => s + (sc.creditBalance?.creditsUsed || 0), 0);
          const outboundCreditSum    = (outboundCalls as any[]).reduce((s: number, c: any) => s + (c.creditsUsed || 0), 0);
          const inboundCreditSum     = Math.max(0, (mainCreditsUsed + subCreditsUsed) - outboundCreditSum);

          // ── Agents ───────────────────────────────────────────────
          const assignedAgents   = agents.filter((a: any) => company.phoneNumbers.some((p: any) => p.inboundAgentId === a.id || p.outboundAgentId === a.id));
          const unassignedAgents = agents.filter((a: any) => !company.phoneNumbers.some((p: any) => p.inboundAgentId === a.id || p.outboundAgentId === a.id));

          // ── Campaigns ────────────────────────────────────────────
          const activeCampaigns = campaigns.filter((c: any) => c.status === "RUNNING");
          const campaignsInfo = campaigns.length > 0
            ? campaigns.map((camp: any) => {
                const exec = (campaignExecutions || []).find((e: any) => e.campaignId === camp.id);
                const csvName   = camp.uploadedFileName || "No CSV";
                const total     = exec?.totalContacts || 0;
                const processed = exec?.processedCount || 0;
                const completed = exec?.statsCompleted || 0;
                const failed    = exec?.statsFailed || 0;
                const left      = Math.max(0, total - processed);
                const qInfo     = camp.currentQStage ? `, Q Stage (Reactivation): ${camp.currentQStage}, Q Status: ${camp.qStatus || "Pending"}` : "";
                const isRunning = camp.status === "RUNNING" || exec?.status === "RUNNING" ? "YES (CURRENTLY RUNNING)" : "NO";
                return `Campaign: ${camp.name} | Running Right Now: ${isRunning} | CSV: ${csvName} | Leads: ${total} | Success: ${completed} | Failed: ${failed} | Remaining: ${left}${qInfo}`;
              }).join("\n")
            : "No campaigns found.";

          // ── Phone numbers ─────────────────────────────────────────
          const numbersInfo = company.phoneNumbers.length > 0
            ? company.phoneNumbers.map((p: any) => {
                const pCalls = rawCallLogs.filter((c: any) => c.phoneNumberId === p.id);
                const pIn    = pCalls.filter((c: any) => c.direction === "INBOUND").length;
                const pOut   = pCalls.filter((c: any) => c.direction === "OUTBOUND").length;
                return `Number: ${p.number} | Label: ${p.label || "Unlabeled"} | Direction: ${p.direction || "Both"} | Channels: ${p.channels ?? "N/A"} | Inbound Calls: ${pIn} | Outbound Calls: ${pOut}`;
              }).join("\n")
            : "None configured";

          // ── Subcompanies ──────────────────────────────────────────
          const subInfo = subcompanies.length > 0
            ? subcompanies.map((s: any) => {
                const sLogs = subCallLogs.filter((c: any) => c.companyId === s.id);
                const phones = s.phoneNumbers?.length > 0
                  ? s.phoneNumbers.map((p: any) => {
                      const pIn  = sLogs.filter((c: any) => c.phoneNumberId === p.id && c.direction === "INBOUND").length;
                      const pOut = sLogs.filter((c: any) => c.phoneNumberId === p.id && c.direction === "OUTBOUND").length;
                      return `  Number: ${p.number} | Direction: ${p.direction || "Both"} | Channels: ${p.channels ?? "N/A"} | Inbound: ${pIn} | Outbound: ${pOut}`;
                    }).join("\n")
                  : "  No phone numbers";
                const totalSIn  = sLogs.filter((c: any) => c.direction === "INBOUND").length;
                const totalSOut = sLogs.filter((c: any) => c.direction === "OUTBOUND").length;
                return `Subcompany: ${s.name} | Status: ${s.status} | Credits Remaining: ${(s.creditBalance?.creditsRemaining || 0).toFixed(2)} | Credits Used: ${(s.creditBalance?.creditsUsed || 0).toFixed(2)} | Inbound: ${totalSIn} | Outbound: ${totalSOut}\n${phones}`;
              }).join("\n\n")
            : "None";

          // ── Billing ───────────────────────────────────────────────
          const billingHistory = billingQuotes?.length > 0
            ? billingQuotes.map((q: any) => `Date: ${dateFmt(q.purchasedAt)}, Total: ${q.grandTotal}, Call Cost: ${q.callCost}`).join("\n")
            : "No recent billing.";

          const allDeductions = [...(creditUsages || []), ...(largestDeductions || []), ...(largestPositiveDeductions || [])]
            .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
          const recentDeductions = allDeductions.length > 0
            ? allDeductions.map((u: any) => `Date: ${dateFmt(u.createdAt)}, Amount: ${u.amount}, Reason: ${u.reason}`).join("\n")
            : "No deductions found.";

          // ── Infra cost ────────────────────────────────────────────
          let infraCostInfo = "INFRA COST NOTIFICATION:\nCurrently Showing: No\nNo active infra cost notification.";
          if (infraCost) {
            const now = new Date();
            const sDate = new Date(infraCost.startDate);
            const eDate = new Date(infraCost.endDate);
            let isShowingNow = false;
            if (!infraCost.pausedUntil || new Date(infraCost.pausedUntil) <= now) {
              const startDay = sDate.getDate(), endDay = eDate.getDate(), curDay = now.getDate();
              const isActiveToday = startDay <= endDay ? (curDay >= startDay && curDay <= endDay) : (curDay >= startDay || curDay <= endDay);
              const startMonth = sDate.getFullYear() * 12 + sDate.getMonth();
              const curMonth   = now.getFullYear()   * 12 + now.getMonth();
              let diff = curMonth - startMonth;
              if (startDay > endDay && curDay <= endDay) diff -= 1;
              let isMonthMatch = false;
              if (infraCost.recurrenceType === "ONCE") { if (now <= eDate) isMonthMatch = true; }
              else if (infraCost.recurrenceType.startsWith("EVERY_")) {
                const interval = parseInt(infraCost.recurrenceType.split("_")[1]) || 1;
                if (diff >= 0 && diff % interval === 0) isMonthMatch = true;
              }
              isShowingNow = isActiveToday && isMonthMatch;
            }
            const schedStr = infraCost.recurrenceType === "ONCE"
              ? `From ${dateFmt(infraCost.startDate)} to ${dateFmt(infraCost.endDate)}`
              : `Day ${sDate.getDate()} to ${eDate.getDate()} every month, Recurrence: ${infraCost.recurrenceType}`;
            infraCostInfo = `INFRA COST NOTIFICATION:\nCurrently Showing: ${isShowingNow ? "Yes" : "No"}\nMessage: ${infraCost.message || "None"}\nSchedule: ${schedStr}\nFor queries: contact support@propnexai.com`;
          }

          const avgSec = rawCallLogs.length > 0
            ? Math.round(rawCallLogs.reduce((s: number, c: any) => s + (c.durationSeconds || 0), 0) / rawCallLogs.length)
            : 0;
          const totalDurSec = rawCallLogs.reduce((s: number, c: any) => s + (c.durationSeconds || 0), 0);

          // ── Build full context ─────────────────────────────────────
          const freshContext = `LIVE DATA — ${company.name}:

PERSONAL DETAILS:
Email: ${user?.email || "Not provided"}
Name: ${user?.firstName || ""} ${user?.lastName || ""}
Phone: ${user?.phone || "Not provided"}

CREDITS & BILLING:
Total Credits Remaining (Main + Subcompanies): ${(mainCreditsRemaining + subCreditsRemaining).toFixed(2)}
Total Credits Used: ${(mainCreditsUsed + subCreditsUsed).toFixed(2)}
Main Credits Remaining: ${mainCreditsRemaining.toFixed(2)}
Main Credits Used: ${mainCreditsUsed.toFixed(2)}
Subcompanies Credits Remaining: ${subCreditsRemaining.toFixed(2)}
Subcompanies Credits Used: ${subCreditsUsed.toFixed(2)}
Credits Used (Inbound): ${inboundCreditSum.toFixed(2)}
Credits Used (Outbound): ${outboundCreditSum.toFixed(2)}
Total Channels: ${company.setupConfig?.totalChannels ?? 0}
Service Number: ${company.setupConfig?.serviceNumber ?? "Not configured"}

RECENT CREDIT DEDUCTIONS:
${recentDeductions}

BILLING HISTORY:
${billingHistory}

${infraCostInfo}

CALL STATS (OVERALL):
Total Calls: ${allCalls.length}
Total Inbound: ${inboundCalls.length}
Total Outbound: ${outboundCalls.length}
Total Reactivation Calls: ${reactivationCalls.length}
Failed Calls: ${allCalls.filter((c: any) => c.status === "FAILED").length}
Average Duration: ${toMinSec(avgSec)}
Total Duration: ${toMinSec(totalDurSec)}

AI AGENTS (${agents.length}):
Assigned (${assignedAgents.length}): ${assignedAgents.map((a: any) => a.name).join(", ") || "None"}
Unassigned (${unassignedAgents.length}): ${unassignedAgents.map((a: any) => a.name).join(", ") || "None"}

CAMPAIGNS:
${campaignsInfo}

PHONE NUMBERS (${company.phoneNumbers.length}):
${numbersInfo}

OUTBOUND CAMPAIGNS:
${company.outboundCampaigns?.length > 0
  ? company.outboundCampaigns.map((c: any) =>
      `Campaign: ${c.name} | Status: ${c.status} | Total Calls: ${c.totalCalls} | Connected: ${c.connectedCalls} | Conversion: ${(c.conversionRate * 100).toFixed(1)}%`
    ).join("\n")
  : "None"}

SUBCOMPANIES (${subcompanies.length}):
${subInfo}

HOW OUTBOUND WORKS & CURRENT STATUS:
There are 3 types of outbound calls:
1. CAMPAIGN: Automated CSV-based calls. Active Campaigns Running Right Now: ${activeCampaigns.length}.
2. INTERNAL: Manual one-to-one calls made directly from the dashboard by an agent to a specific customer.
3. LEAD REACTIVATION (Q1/Q2/Q3): At 11:50 PM IST each night, the system scans all FAILED/NO_ANSWER calls. It schedules 3 automatic retry waves — Q1 at 10 AM, Q2 at 3 PM, Q3 at 8 PM the next day. It only retries leads that have not yet answered.

LEAD REACTIVATION HISTORY (${reactivationCalls.length} total reactivation calls):
${reactLines.length > 0 ? reactLines.join("\n") : "No reactivation calls found yet."}

ABSOLUTE HIGHEST CALLER ACROSS ENTIRE DATABASE:
${absoluteHighestCaller ? `Number: ${absoluteHighestCaller.phone} | Name: ${absoluteHighestCaller.name} | Total Calls: ${absoluteHighestCaller.inbound + absoluteHighestCaller.outbound} | Total Duration: ${toMinSec(absoluteHighestCaller.totalDuration)}` : "None"}

TOP 50 CUSTOMERS BY TOTAL CALLS (Fallback for generic queries):
${topByTotalEnriched.map(c => `Customer: ${c.phone} | Name: ${c.name} | Total: ${c.inbound + c.outbound} (In: ${c.inbound}, Out: ${c.outbound}) | Total Duration: ${toMinSec(c.totalDuration)} | Last Call: ${dateFmt(c.lastCall)}`).join("\n") || "No customer data."}

TOP 10 CUSTOMERS BY INBOUND CALLS:
${topInboundEnriched.map(c => `${c.phone} | Name: ${c.name} | Inbound: ${c.inbound} | Duration: ${toMinSec(c.totalDuration)}`).join("\n") || "None"}

TOP 10 CUSTOMERS BY OUTBOUND CALLS:
${topOutboundEnriched.map(c => `${c.phone} | Name: ${c.name} | Outbound: ${c.outbound} | Duration: ${toMinSec(c.totalDuration)}`).join("\n") || "None"}

PER-DAY CALL SUMMARY (Last 60 days):
${perDayLines.join("\n") || "No data."}

TOP CALLERS PER DAY (Last 14 days):
${perDayCustomerLines.join("\n") || "No data."}

RECORDING URLS (Last 50 calls with recordings):
${recordingLines.join("\n") || "No recordings found."}

NOTABLE CALLS:
Longest Inbound: ${formatCall(longestIn)}
Longest Outbound: ${formatCall(longestOut)}

TOP 10 MOST EXPENSIVE CALLS:
${top10Calls.map(formatCallShort).join("\n")}

20 MOST RECENT CALLS:
${recent20.map(formatCallShort).join("\n")}`;

          setCachedContext(companyId, freshContext);
          realTimeContext = `${systemRules}\n\n${freshContext}`;
        }
      }
    }

    // ── Build Gemini payload ──────────────────────────────────────────────
    const systemPrompt = `${CHATBOT_RULEBOOK}\n\n${realTimeContext}`;

    let geminiMessages: { role: string; parts: { text: string }[] }[] = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    while (geminiMessages.length > 0 && geminiMessages[0].role === "model") {
      geminiMessages.shift();
    }

    const merged: { role: string; parts: { text: string }[] }[] = [];
    for (const msg of geminiMessages) {
      const last = merged[merged.length - 1];
      if (last && last.role === msg.role) {
        last.parts[0].text += "\n" + msg.parts[0].text;
      } else {
        merged.push({ ...msg, parts: [{ text: msg.parts[0].text }] });
      }
    }

    const payload = {
      systemInstruction: { role: "user", parts: [{ text: systemPrompt }] },
      contents: merged,
      generationConfig: {
        temperature: 0.15,
        maxOutputTokens: 1500,
        candidateCount: 1,
      },
    };

    const geminiRes = await callGemini(payload);

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      console.error("Gemini API Error:", err);
      return NextResponse.json({ error: `Gemini API Error: ${err}` }, { status: 500 });
    }

    // ── Stream response ──────────────────────────────────────────────────
    const stream = new ReadableStream({
      async start(controller) {
        const reader = geminiRes.body?.getReader();
        if (!reader) { controller.close(); return; }

        const dec = new TextDecoder();
        let buf = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buf += dec.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (raw === "[DONE]") { controller.close(); return; }
            try {
              const parsed = JSON.parse(raw);
              const chunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              if (chunk) {
                const clean = chunk
                  .replace(/\*\*/g, "")
                  .replace(/^#+\s*/gm, "")
                  .replace(/\*([^*]+)\*/g, "$1")
                  .replace(/_{2}([^_]+)_{2}/g, "$1");
                controller.enqueue(new TextEncoder().encode(clean));
              }
            } catch (_) { /* partial JSON — skip */ }
          }
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-store",
        "X-Accel-Buffering": "no",
      },
    });

  } catch (error: any) {
    console.error("Chatbot API Error:", error);
    return NextResponse.json(
      { error: error?.message || "AI service unavailable" },
      { status: 500 }
    );
  }
}
