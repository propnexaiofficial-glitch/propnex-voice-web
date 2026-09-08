import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getNextGeminiKey } from "@/lib/gemini-keys";
import { CHATBOT_RULEBOOK } from "@/lib/rulebook";

export const dynamic = "force-dynamic";

// ── In-memory cache for company context (avoids DB hit on every message) ──
const contextCache = new Map<string, { context: string; ts: number }>();
const CACHE_TTL_MS = 30_000; // 30 seconds

function getCachedContext(companyId: string): string | null {
  const hit = contextCache.get(companyId);
  if (hit && Date.now() - hit.ts < CACHE_TTL_MS) return hit.context;
  return null;
}
function setCachedContext(companyId: string, context: string) {
  contextCache.set(companyId, { context, ts: Date.now() });
}

const toMinSec = (secs: number) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m} min ${s} sec` : `${s} sec`;
};

export async function POST(req: Request) {
  try {
    const { messages, companyId, firstName, user } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages array" }, { status: 400 });
    }

    const userName = firstName || "there";

    const systemRules = `SYSTEM RULES (every response, no exceptions):
1. Address the user naturally like "Yes ${userName}", "Of course ${userName}", or "Here is the information, ${userName}". Do NOT use "Hello ${userName}" or "Hey ${userName}".
2. NEVER use markdown: no **, no #, no _, no bullet dashes. Plain text only.
3. Be HIGHLY CONCISE. ONLY answer the exact question asked. Do not add unsolicited extra information.
4. You are Task Desk — the smart personal assistant for the Propnex platform.
5. Use exact numbers from context. Never say "I don't know" if data is available.
6. For phone numbers always show: Number: +XXXXXXXXXXX, Direction: Inbound/Outbound, Channels: N.
7. For durations always use "X min Y sec" format.
8. If asked about missing inbound/outbound numbers for a subcompany, explicitly tell the user to click the "Request" button in the dashboard to request a new number.
9. If asked about Lead Reactivation or retries, explain that the system automatically runs 3 times (in 3 waves/stages: Q1, Q2, and Q3) to follow up with dormant or failed leads.
10. If asked about the Force Stop button on a campaign, explain that it immediately halts the campaign execution, stopping any further outbound calls from being made.
11. If asked how to search in Inbound, Outbound, or Subcompanies pages, explain that the user can use the search bar at the top of the respective page to filter by name, phone number, or status.`;

    // ── Try cache first, then DB ──
    let realTimeContext = `${systemRules}\n\nUser: ${userName}\nCompany: Not connected.`;

    if (companyId) {
      const cached = getCachedContext(companyId);

      if (cached) {
        realTimeContext = `${systemRules}\n\n${cached}`;
      } else {
        const [company, subcompanies, billingQuotes, creditUsages, agents, campaigns, campaignExecutions] = await Promise.all([
          prisma.company.findUnique({
            where: { id: companyId },
            include: {
              creditBalance: true,
              phoneNumbers: true,
              outboundCampaigns: true,
              setupConfig: true,
            }
          }) as any,
          prisma.company.findMany({
            where: { parentCompanyId: companyId },
            include: { creditBalance: true, phoneNumbers: true }
          }) as any,
          prisma.billingQuote.findMany({
            where: { companyId, status: "PURCHASED" },
            orderBy: { purchasedAt: 'desc' },
            take: 5
          }) as any,
          prisma.creditUsage.findMany({
            where: { companyId },
            orderBy: { createdAt: 'desc' },
            take: 10
          }) as any,
          prisma.aiAgent.findMany({
            where: { companyId }
          }) as any,
          prisma.campaign.findMany({
            where: { companyId }
          }) as any,
          prisma.campaignExecution.findMany({
            where: { companyId }
          }) as any,
        ]);

        const callLogs = await prisma.callLog.findMany({
          where: { companyId },
          select: { 
            id: true,
            direction: true, 
            status: true, 
            durationSeconds: true,
            cost: true,
            creditsUsed: true,
            startedAt: true,
            phoneNumberId: true
          }
        });

        const subCompanyIds = subcompanies.map((s: any) => s.id);
        const subCallLogs = subCompanyIds.length > 0 ? await prisma.callLog.findMany({
          where: { companyId: { in: subCompanyIds } },
          select: { companyId: true, direction: true, phoneNumberId: true }
        }) : [];

        if (company) {
          const inboundCalls  = callLogs.filter((c: any) => c.direction === "INBOUND");
          const outboundCalls = callLogs.filter((c: any) => c.direction === "OUTBOUND");
          const failedCalls   = callLogs.filter((c: any) => c.status   === "FAILED");
          
          const inboundCreditSum = inboundCalls.reduce((acc: number, c: any) => acc + (c.creditsUsed || 0), 0);
          const outboundCreditSum = outboundCalls.reduce((acc: number, c: any) => acc + (c.creditsUsed || 0), 0);
          
          const sortedByCost = [...callLogs].sort((a: any, b: any) => (b.creditsUsed || 0) - (a.creditsUsed || 0));
          const top10Calls = sortedByCost.slice(0, 10);
          const top10CreditSum = top10Calls.reduce((acc: number, c: any) => acc + (c.creditsUsed || 0), 0);
          
          const sortedByDate = [...callLogs].sort((a: any, b: any) => new Date(b.startedAt || 0).getTime() - new Date(a.startedAt || 0).getTime());
          const recent10Calls = sortedByDate.slice(0, 10);
          
          const totalDurationSeconds = callLogs.reduce((acc: number, c: any) => acc + (c.durationSeconds || 0), 0);
          
          const assignedAgents = agents.filter((a: any) => company.phoneNumbers.some((p: any) => p.inboundAgentId === a.id || p.outboundAgentId === a.id));
          const unassignedAgents = agents.filter((a: any) => !company.phoneNumbers.some((p: any) => p.inboundAgentId === a.id || p.outboundAgentId === a.id));
          
          const agentInfo = `Total Agents: ${agents.length}
Assigned Agents (${assignedAgents.length}): ${assignedAgents.map((a: any) => a.name).join(', ') || 'None'}
Unassigned Agents (${unassignedAgents.length}): ${unassignedAgents.map((a: any) => a.name).join(', ') || 'None'}`;
          
          const campaignsInfo = campaigns.length > 0 
            ? campaigns.map((camp: any) => {
                const exec = (campaignExecutions || []).find((e: any) => e.campaignId === camp.id);
                const csvName = camp.uploadedFileName || "No CSV File";
                const total = exec?.totalContacts || 0;
                const processed = exec?.processedCount || 0;
                const completed = exec?.statsCompleted || 0;
                const failed = exec?.statsFailed || 0;
                const left = Math.max(0, total - processed);
                const qInfo = camp.currentQStage ? `, Q Stage: ${camp.currentQStage}, Q Status: ${camp.qStatus || 'Pending'}` : '';
                return `- Campaign: ${camp.name}, CSV: ${csvName}, Total Leads: ${total}, Completed: ${completed}, Failed: ${failed}, Left: ${left}${qInfo}`;
              }).join("\n")
            : "No campaigns found.";

          const maxInbound  = inboundCalls.length  > 0 ? Math.max(...inboundCalls.map((c: any)  => c.durationSeconds || 0)) : 0;
          const maxOutbound = outboundCalls.length > 0 ? Math.max(...outboundCalls.map((c: any) => c.durationSeconds || 0)) : 0;
          
          let longestInboundCall = inboundCalls.find((c: any) => c.durationSeconds === maxInbound && c.durationSeconds > 0);
          let longestOutboundCall = outboundCalls.find((c: any) => c.durationSeconds === maxOutbound && c.durationSeconds > 0);
          
          // Fetch leads ONLY for the notable calls to avoid massive join on all call logs
          const notableIds = [longestInboundCall?.id, longestOutboundCall?.id, ...top10Calls.map((c:any)=>c.id), ...recent10Calls.map((c:any)=>c.id)].filter(Boolean);
          if (notableIds.length > 0) {
            const notableLeads = await prisma.callLog.findMany({
              where: { id: { in: notableIds } },
              select: { id: true, lead: { select: { phone: true, firstName: true, lastName: true } } }
            });
            const leadMap = new Map(notableLeads.map((c: any) => [c.id, c.lead]));
            if (longestInboundCall) (longestInboundCall as any).lead = leadMap.get(longestInboundCall.id);
            if (longestOutboundCall) (longestOutboundCall as any).lead = leadMap.get(longestOutboundCall.id);
            top10Calls.forEach((c: any) => c.lead = leadMap.get(c.id));
            recent10Calls.forEach((c: any) => c.lead = leadMap.get(c.id));
          }

          const formatCall = (c: any) => c ? `Customer Number: ${c.lead?.phone || 'Unknown'}, Customer Name: ${c.lead?.firstName || ''} ${c.lead?.lastName || ''}, Duration: ${toMinSec(c.durationSeconds)}, Credits Used: ${c.creditsUsed || 0}, Cost: $${c.cost || 0}` : "None";
          const formatCallVerbose = (c: any) => c ? `- Num: ${c.lead?.phone || 'Unknown'}, Dir: ${c.direction}, Dur: ${toMinSec(c.durationSeconds)}, Credits: ${c.creditsUsed || 0}, Date: ${new Date(c.startedAt).toLocaleDateString()}` : "";

          const avgSec      = callLogs.length      > 0
            ? Math.round(callLogs.reduce((sum: number, c: any) => sum + (c.durationSeconds || 0), 0) / callLogs.length) : 0;

          const numbersInfo = company.phoneNumbers.length > 0
            ? company.phoneNumbers.map((p: any) => {
                const pCalls = callLogs.filter((c: any) => c.phoneNumberId === p.id);
                const pIn = pCalls.filter((c: any) => c.direction === "INBOUND").length;
                const pOut = pCalls.filter((c: any) => c.direction === "OUTBOUND").length;
                return `Number: ${p.number} | Label: ${p.label || "Unlabeled"} | Direction: ${p.direction || "Both"} | Channels: ${p.channels ?? "N/A"} | Provider: ${p.provider} | Total Inbound Calls: ${pIn} | Total Outbound Calls: ${pOut}`;
              }).join("\n")
            : "None configured";

          const campaignInfo = company.outboundCampaigns.length > 0
            ? company.outboundCampaigns.map((c: any) =>
                `Campaign: ${c.name} | Status: ${c.status} | Total Calls: ${c.totalCalls} | Connected: ${c.connectedCalls} | Conversion: ${(c.conversionRate * 100).toFixed(1)}%`
              ).join("\n")
            : "None";

          const subInfo = subcompanies.length > 0
            ? subcompanies.map((s: any) => {
                const sLogs = subCallLogs.filter((c: any) => c.companyId === s.id);
                const sInbound = sLogs.filter((c: any) => c.direction === "INBOUND").length;
                const sOutbound = sLogs.filter((c: any) => c.direction === "OUTBOUND").length;
                const phones = s.phoneNumbers?.length > 0
                  ? s.phoneNumbers.map((p: any) => {
                      const pCalls = sLogs.filter((c: any) => c.phoneNumberId === p.id);
                      const pIn = pCalls.filter((c: any) => c.direction === "INBOUND").length;
                      const pOut = pCalls.filter((c: any) => c.direction === "OUTBOUND").length;
                      return `  Number: ${p.number} | Direction: ${p.direction || "Both"} | Channels: ${p.channels ?? "N/A"} | Total Inbound Calls: ${pIn} | Total Outbound Calls: ${pOut}`;
                    }).join("\n")
                  : "  No phone numbers";
                return `Subcompany: ${s.name} | Status: ${s.status} | Credits Remaining: ${s.creditBalance?.creditsRemaining?.toFixed(2) ?? 0} | Credits Used: ${s.creditBalance?.creditsUsed?.toFixed(2) ?? 0} | Total Inbound Calls: ${sInbound} | Total Outbound Calls: ${sOutbound}\n${phones}`;
              }).join("\n\n")
            : "None";

          const billingHistory = billingQuotes && billingQuotes.length > 0 
            ? billingQuotes.map((q: any) => `- Date: ${q.purchasedAt ? new Date(q.purchasedAt).toLocaleDateString() : 'Unknown'}, Total: $${q.grandTotal}, Call Cost Portion: $${q.callCost}`).join("\n")
            : "No recent billing purchases found.";

          const recentDeductions = creditUsages && creditUsages.length > 0
            ? creditUsages.map((u: any) => `- Date: ${new Date(u.createdAt).toLocaleDateString()}, Amount: ${u.amount}, Reason: ${u.reason}, Description: ${u.description || 'None'}`).join("\n")
            : "No recent credit usage deductions found.";

          const freshContext = `LIVE DATA — ${company.name}:

PERSONAL DETAILS:
Email: ${user?.email || "Not provided"}
Name: ${user?.firstName || ""} ${user?.lastName || ""}
Signup Phone: ${user?.phone || "Not provided"}

CREDITS & BILLING:
Credits Remaining: ${company.creditBalance?.creditsRemaining?.toFixed(2) ?? 0}
Credits Used Total: ${company.creditBalance?.creditsUsed?.toFixed(2) ?? 0}
Credits Used (Inbound): ${inboundCreditSum.toFixed(2)}
Credits Used (Outbound): ${outboundCreditSum.toFixed(2)}
Total Channels: ${company.setupConfig?.totalChannels ?? 0}
Service Number: ${company.setupConfig?.serviceNumber ?? "Not configured"}

RECENT DEDUCTIONS / MISC FEES (Top 10):
${recentDeductions}

BILLING HISTORY:
${billingHistory}

CALL STATS:
Total Inbound Calls: ${inboundCalls.length}
Total Outbound Calls: ${outboundCalls.length}
Failed Inbound Calls: ${callLogs.filter((c: any) => c.direction === "INBOUND" && c.status === "FAILED").length}
Failed Outbound Calls: ${callLogs.filter((c: any) => c.direction === "OUTBOUND" && c.status === "FAILED").length}
Total Failed Calls: ${failedCalls.length}
Average Duration: ${toMinSec(avgSec)}
Total Recording / Call Duration: ${toMinSec(totalDurationSeconds)}

AI AGENTS:
${agentInfo}

CAMPAIGNS & CSVs:
${campaignsInfo}

NOTABLE CALLS:
Longest Inbound Call: ${formatCall(longestInboundCall)}
Longest Outbound Call: ${formatCall(longestOutboundCall)}

TOP 10 MOST EXPENSIVE CALLS (Total Credits: ${top10CreditSum.toFixed(2)}):
${top10Calls.map(formatCallVerbose).join("\n")}

10 MOST RECENT CALLS:
${recent10Calls.map(formatCallVerbose).join("\n")}

PHONE NUMBERS (${company.phoneNumbers.length}):
${numbersInfo}

CAMPAIGNS (${company.outboundCampaigns.length}):
${campaignInfo}

SUBCOMPANIES (${subcompanies.length}):
${subInfo}`;

          setCachedContext(companyId, freshContext);
          realTimeContext = `${systemRules}\n\n${freshContext}`;
        }
      }
    }

    // ── Build Gemini payload ──
    const systemPrompt = `${CHATBOT_RULEBOOK}\n\n${realTimeContext}`;

    let geminiMessages: { role: string; parts: { text: string }[] }[] = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }]
    }));

    // Strip leading model messages (Gemini requires first = user)
    while (geminiMessages.length > 0 && geminiMessages[0].role === "model") {
      geminiMessages.shift();
    }

    // Merge consecutive same-role messages
    const merged: { role: string; parts: { text: string }[] }[] = [];
    for (const msg of geminiMessages) {
      const last = merged[merged.length - 1];
      if (last && last.role === msg.role) {
        last.parts[0].text += "\n" + msg.parts[0].text;
      } else {
        merged.push({ ...msg, parts: [{ text: msg.parts[0].text }] });
      }
    }

    const apiKey = getNextGeminiKey();
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:streamGenerateContent?alt=sse&key=${apiKey}`;

    const payload = {
      systemInstruction: { role: "user", parts: [{ text: systemPrompt }] },
      contents: merged,
      generationConfig: {
        temperature: 0.2,       // Lower = faster + more factual
        maxOutputTokens: 1024,  // Enough for full answers, not wasteful
        candidateCount: 1,
      }
    };

    const geminiRes = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      console.error("Gemini API Error:", err);
      return NextResponse.json({ error: "AI service unavailable" }, { status: 500 });
    }

    // ── Stream response directly, stripping markdown on-the-fly ──
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
          buf = lines.pop() ?? ""; // Keep incomplete line in buffer

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
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-store",
        "X-Accel-Buffering": "no",  // Disable nginx buffering for instant streaming
      },
    });

  } catch (error: any) {
    console.error("Chatbot API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
