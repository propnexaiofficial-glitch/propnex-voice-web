import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getNextGeminiKey } from "@/lib/gemini-keys";
import { CHATBOT_RULEBOOK } from "@/lib/rulebook";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { messages, companyId, firstName } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages array" }, { status: 400 });
    }

    const userName = firstName || "there";

    const systemRules = `
SYSTEM RULES (apply to every single response without exception):
1. Always address the user by their first name "${userName}" naturally in responses.
2. NEVER use markdown formatting. No asterisks (**), no hashes (#), no underscores (_). Plain text only.
3. Keep answers short and to the point. 2-5 sentences max unless listing data.
4. You are the user's Personal Assistant for the Propnex platform — smart, concise, and always helpful.
5. When user asks about data available in the context, provide exact numbers. Never say "I don't know" if context has the answer.
`;

    let realTimeContext = `${systemRules}\n\nUser: ${userName}\nCompany Data: Not connected.`;

    if (companyId) {
      // Run all queries in parallel for maximum speed
      const [company, callLogs, subcompanies] = await Promise.all([
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
          select: { direction: true, status: true, durationSeconds: true }
        }),
        prisma.company.findMany({
          where: { parentCompanyId: companyId },
          include: {
            creditBalance: true,
            phoneNumbers: true,
          }
        }) as any,
      ]);

      if (company) {
        const inboundCalls = callLogs.filter(c => c.direction === "INBOUND");
        const outboundCalls = callLogs.filter(c => c.direction === "OUTBOUND");
        const failedCalls = callLogs.filter(c => c.status === "FAILED");
        const inboundFailed = inboundCalls.filter(c => c.status === "FAILED").length;
        const outboundFailed = outboundCalls.filter(c => c.status === "FAILED").length;
        const avgDuration = callLogs.length > 0
          ? Math.round(callLogs.reduce((sum, c) => sum + (c.durationSeconds || 0), 0) / callLogs.length)
          : 0;

        const phoneNumbersInfo = company.phoneNumbers.length > 0
          ? company.phoneNumbers.map((p: any) =>
              `  - ${p.number} (${p.label || "Unlabeled"}) | Direction: ${p.direction || "N/A"} | Channels: ${p.channels ?? "N/A"} | Provider: ${p.provider}`
            ).join("\n")
          : "  None";

        const campaignInfo = company.outboundCampaigns.length > 0
          ? company.outboundCampaigns.map((c: any) =>
              `  - ${c.name} [${c.status}] | Total Calls: ${c.totalCalls} | Connected: ${c.connectedCalls} | Conversion: ${(c.conversionRate * 100).toFixed(1)}%`
            ).join("\n")
          : "  None";

        const subcompanyInfo = subcompanies.length > 0
          ? subcompanies.map((s: any) => {
              const subPhones = s.phoneNumbers && s.phoneNumbers.length > 0
                ? s.phoneNumbers.map((p: any) =>
                    `    * ${p.number} (${p.label || "Unlabeled"}) [${p.direction || "N/A"}] Channels: ${p.channels ?? "N/A"}`
                  ).join("\n")
                : "    * No phone numbers";
              return `  - ${s.name} [${s.status}] | Credits Remaining: ${(s.creditBalance as any)?.creditsRemaining?.toFixed(2) ?? 0} | Credits Used: ${(s.creditBalance as any)?.creditsUsed?.toFixed(2) ?? 0}\n${subPhones}`;
            }).join("\n")
          : "  None";

        realTimeContext = `
${systemRules}

LIVE ACCOUNT DATA for ${userName} at ${company.name}:

[CREDITS & BILLING]
- Credits Remaining: ${company.creditBalance?.creditsRemaining?.toFixed(2) ?? 0}
- Credits Used: ${company.creditBalance?.creditsUsed?.toFixed(2) ?? 0}
- Total Channels: ${company.setupConfig?.totalChannels ?? 0}
- Service Number: ${company.setupConfig?.serviceNumber ?? "Not configured"}
- Cost Per Credit: ${(company as any).billingRates?.costPerCredit ?? "N/A"}

[CALL STATISTICS]
- Total Inbound Calls: ${inboundCalls.length}
- Total Outbound Calls: ${outboundCalls.length}
- Total Failed Calls: ${failedCalls.length} (Inbound Failed: ${inboundFailed} | Outbound Failed: ${outboundFailed})
- Average Call Duration: ${avgDuration} seconds

[PHONE NUMBERS (${company.phoneNumbers.length} total)]
${phoneNumbersInfo}

[OUTBOUND CAMPAIGNS (${company.outboundCampaigns.length} total)]
${campaignInfo}

[SUBCOMPANIES (${subcompanies.length} total)]
${subcompanyInfo}
`;
      }
    }

    const systemPrompt = `${CHATBOT_RULEBOOK}\n\n${realTimeContext}`;

    let geminiMessages: { role: string; parts: { text: string }[] }[] = [];
    for (const msg of messages) {
      geminiMessages.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }]
      });
    }

    // Gemini requires first message from 'user'
    while (geminiMessages.length > 0 && geminiMessages[0].role === "model") {
      geminiMessages.shift();
    }

    // Merge consecutive same-role messages
    const mergedMessages: { role: string; parts: { text: string }[] }[] = [];
    for (const msg of geminiMessages) {
      const lastMsg = mergedMessages[mergedMessages.length - 1];
      if (lastMsg && lastMsg.role === msg.role) {
        lastMsg.parts[0].text += "\n\n" + msg.parts[0].text;
      } else {
        mergedMessages.push({ ...msg });
      }
    }

    const apiKey = getNextGeminiKey();
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:streamGenerateContent?alt=sse&key=${apiKey}`;

    const payload = {
      systemInstruction: {
        role: "user",
        parts: [{ text: systemPrompt }]
      },
      contents: mergedMessages,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 400,
      }
    };

    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error:", errorText);
      return NextResponse.json({ error: "Failed to generate response from AI" }, { status: 500 });
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) { controller.close(); return; }

        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.slice(6).trim();
              if (dataStr === "[DONE]") { controller.close(); return; }
              try {
                const data = JSON.parse(dataStr);
                const textChunk = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (textChunk) {
                  // Strip any markdown the model might still produce
                  const clean = textChunk.replace(/\*\*/g, "").replace(/^#+\s/gm, "").replace(/\*([^*]+)\*/g, "$1");
                  controller.enqueue(new TextEncoder().encode(clean));
                }
              } catch (_) { /* ignore partial chunks */ }
            }
          }
        }
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });

  } catch (error: any) {
    console.error("Chatbot API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
