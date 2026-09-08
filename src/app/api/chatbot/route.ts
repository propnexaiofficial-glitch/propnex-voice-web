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

    let realTimeContext = `User Identity Context: The user's name is ${firstName || "Unknown"}.\n\nIMPORTANT SYSTEM RULES:\n1. Personalize your answers using the user's name if appropriate.\n2. Do NOT use markdown bolding (asterisks **) or any markdown formatting in your responses. Keep responses in plain text. Keep your responses extremely concise and to the point.\n\nReal-time User Context: Unknown Company.`;

    // 1. Retrieve Real-Time Context from MongoDB via Prisma
    if (companyId) {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        include: {
          creditBalance: true,
          phoneNumbers: true,
          childCompanies: { select: { name: true, status: true, creditBalance: true } },
          outboundCampaigns: {
            where: { status: "ACTIVE" },
            select: { name: true, status: true }
          }
        }
      });

      if (company) {
        // Aggregate call metrics
        const callLogs = await prisma.callLog.findMany({
          where: { companyId },
          select: { direction: true, durationSeconds: true }
        });

        const inboundCalls = callLogs.filter(c => c.direction === "INBOUND").length;
        const outboundCalls = callLogs.filter(c => c.direction === "OUTBOUND").length;
        const maxDuration = callLogs.length > 0 ? Math.max(...callLogs.map(c => c.durationSeconds || 0)) : 0;

        realTimeContext = `
        User Identity Context: The user's name is ${firstName || "Unknown"}.
        
        IMPORTANT SYSTEM RULES:
        1. Personalize your answers using the user's name.
        2. Do NOT use markdown bolding (asterisks **) or any markdown formatting in your responses. Keep responses in plain text. Keep your responses extremely concise and to the point.

        Real-time User Context:
        - Company Name: ${company.name}
        - Total Inbound Calls: ${inboundCalls}
        - Total Outbound Calls: ${outboundCalls}
        - Highest Call Duration: ${maxDuration} seconds
        - Available Credits: ${company.creditBalance?.creditsRemaining || 0}
        - Total Credits Used: ${company.creditBalance?.creditsUsed || 0}
        - Active Phone Numbers: ${company.phoneNumbers.length}
        - Active Outbound Campaigns: ${company.outboundCampaigns.map(c => c.name).join(", ") || "None"}
        - Number of Subcompanies: ${company.childCompanies.length}
        `;
      }
    }

    // 2. Build the System Prompt (RAG - Rulebook + Real-Time Context)
    const systemPrompt = `${CHATBOT_RULEBOOK}\n\n${realTimeContext}`;

    // 3. Format messages for Gemini API
    let geminiMessages = [];
    for (const msg of messages) {
      geminiMessages.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }]
      });
    }

    // Gemini API STRICTLY requires the first message to be from the 'user'
    // If the frontend sends the initial bot greeting first, we must strip it out.
    while (geminiMessages.length > 0 && geminiMessages[0].role === "model") {
      geminiMessages.shift();
    }

    // Gemini API STRICTLY requires alternating roles (user -> model -> user -> model)
    // We must merge consecutive messages from the same role.
    const mergedMessages = [];
    for (const msg of geminiMessages) {
      const lastMsg = mergedMessages[mergedMessages.length - 1];
      if (lastMsg && lastMsg.role === msg.role) {
        lastMsg.parts[0].text += "\n\n" + msg.parts[0].text;
      } else {
        mergedMessages.push(msg);
      }
    }
    
    // Insert System Prompt into the payload for Gemini 1.5/2.5 API
    const payload = {
      systemInstruction: {
        role: "user",
        parts: [{ text: systemPrompt }]
      },
      contents: mergedMessages,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      }
    };

    // 4. Rotate Gemini API Key
    const apiKey = getNextGeminiKey();
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:streamGenerateContent?alt=sse&key=${apiKey}`;

    // 5. Call Gemini API
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error:", errorText);
      return NextResponse.json({ error: "Failed to generate response from AI" }, { status: 500 });
    }

    // 6. Return Streaming Response
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.replace("data: ", "").trim();
              if (dataStr === "[DONE]") {
                controller.close();
                return;
              }
              try {
                const data = JSON.parse(dataStr);
                const textChunk = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (textChunk) {
                  controller.enqueue(new TextEncoder().encode(textChunk));
                }
              } catch (e) {
                // Ignore parsing errors for incomplete chunks
              }
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
