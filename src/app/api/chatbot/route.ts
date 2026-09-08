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
1. Address the user by name ("${userName}") in a natural, conversational way. Do NOT mechanically start every single response with "Hello ${userName}". Vary your greetings and tone to sound more human-like.
2. NEVER use markdown: no **, no #, no _, no bullet dashes. Plain text only.
3. Be concise. Complete sentences. Never cut off mid-answer.
4. You are Task Desk — the smart personal assistant for the Propnex platform.
5. Use exact numbers from context. Never say "I don't know" if data is available.
6. For phone numbers always show: Number: +XXXXXXXXXXX, Direction: Inbound/Outbound, Channels: N.
7. For durations always use "X min Y sec" format.`;

    // ── Try cache first, then DB ──
    let realTimeContext = `${systemRules}\n\nUser: ${userName}\nCompany: Not connected.`;

    if (companyId) {
      const cached = getCachedContext(companyId);

      if (cached) {
        realTimeContext = `${systemRules}\n\n${cached}`;
      } else {
        const [company, callLogs, subcompanies, billingQuotes, creditUsages] = await Promise.all([
          prisma.company.findUnique({
            where: { id: companyId },
            include: {
              creditBalance: true,
              phoneNumbers: true,
              outboundCampaigns: true,
              setupConfig: true,
            }
          }) as any,
          prisma.callLog.findMany({
            where: { companyId },
            select: { 
              direction: true, 
              status: true, 
              durationSeconds: true,
              cost: true,
              creditsUsed: true,
              startedAt: true,
              lead: { select: { phone: true, firstName: true, lastName: true } },
              phoneNumber: { select: { number: true } }
            }
          }),
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
        ]);

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

          const maxInbound  = inboundCalls.length  > 0 ? Math.max(...inboundCalls.map((c: any)  => c.durationSeconds || 0)) : 0;
          const maxOutbound = outboundCalls.length > 0 ? Math.max(...outboundCalls.map((c: any) => c.durationSeconds || 0)) : 0;
          const maxOverall  = callLogs.length      > 0 ? Math.max(...callLogs.map((c: any)      => c.durationSeconds || 0)) : 0;
          
          const longestInboundCall = inboundCalls.find((c: any) => c.durationSeconds === maxInbound && c.durationSeconds > 0);
          const longestOutboundCall = outboundCalls.find((c: any) => c.durationSeconds === maxOutbound && c.durationSeconds > 0);
          
          const formatCall = (c: any) => c ? `Customer Number: ${c.lead?.phone || 'Unknown'}, Customer Name: ${c.lead?.firstName || ''} ${c.lead?.lastName || ''}, Duration: ${toMinSec(c.durationSeconds)}, Credits Used: ${c.creditsUsed || 0}, Cost: $${c.cost || 0}` : "None";
          const formatCallVerbose = (c: any) => c ? `- Num: ${c.lead?.phone || 'Unknown'}, Dir: ${c.direction}, Dur: ${toMinSec(c.durationSeconds)}, Credits: ${c.creditsUsed || 0}, Date: ${new Date(c.startedAt).toLocaleDateString()}` : "";

          const avgSec      = callLogs.length      > 0
            ? Math.round(callLogs.reduce((sum: number, c: any) => sum + (c.durationSeconds || 0), 0) / callLogs.length) : 0;

          const numbersInfo = company.phoneNumbers.length > 0
            ? company.phoneNumbers.map((p: any) =>
                `Number: ${p.number} | Label: ${p.label || "Unlabeled"} | Direction: ${p.direction || "Both"} | Channels: ${p.channels ?? "N/A"} | Provider: ${p.provider}`
              ).join("\n")
            : "None configured";

          const campaignInfo = company.outboundCampaigns.length > 0
            ? company.outboundCampaigns.map((c: any) =>
                `Campaign: ${c.name} | Status: ${c.status} | Total Calls: ${c.totalCalls} | Connected: ${c.connectedCalls} | Conversion: ${(c.conversionRate * 100).toFixed(1)}%`
              ).join("\n")
            : "None";

          const subInfo = subcompanies.length > 0
            ? subcompanies.map((s: any) => {
                const phones = s.phoneNumbers?.length > 0
                  ? s.phoneNumbers.map((p: any) =>
                      `  Number: ${p.number} | Direction: ${p.direction || "Both"} | Channels: ${p.channels ?? "N/A"}`
                    ).join("\n")
                  : "  No phone numbers";
                return `Subcompany: ${s.name} | Status: ${s.status} | Credits Remaining: ${s.creditBalance?.creditsRemaining?.toFixed(2) ?? 0} | Credits Used: ${s.creditBalance?.creditsUsed?.toFixed(2) ?? 0}\n${phones}`;
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
