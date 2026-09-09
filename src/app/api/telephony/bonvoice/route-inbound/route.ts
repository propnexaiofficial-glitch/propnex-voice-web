import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getBonvoiceToken } from "@/lib/bonvoice";

export async function POST(req: Request) {
  try {
    const { phoneNumberId, agentId } = await req.json();

    if (!phoneNumberId || !agentId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const phoneNumber = await prisma.phoneNumber.findUnique({
      where: { id: phoneNumberId },
    });

    if (!phoneNumber) {
      return NextResponse.json({ error: "Phone number not found" }, { status: 404 });
    }

    // Authenticate with Bonvoice
    const token = await getBonvoiceToken();

    // The Voicebot WebSocket URL (e.g. from the Propnex dashboard config or hardcoded for Render)
    const template_url = process.env.BONVOICE_VOICEBOT_URL || "wss://vineeth-inbound.onrender.com/ws/voice-agent";

    // Register inbound route on Bonvoice
    const baseUrl = process.env.BONVOICE_BASE_URL || "https://backend.pbx.bonvoice.com";
    const bonvoiceRes = await fetch(`${baseUrl}/external-route-create/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${token}`
      },
      body: JSON.stringify({
        did: phoneNumber.number,
        template_url: template_url,
        agent_id: agentId // Optional: Pass standard AI context if supported by Bonvoice API payload
      }),
    });

    if (!bonvoiceRes.ok) {
      const errBody = await bonvoiceRes.text();
      console.error("Bonvoice route creation failed:", errBody);
      return NextResponse.json({ error: "Bonvoice API error", details: errBody }, { status: bonvoiceRes.status });
    }

    // Update PhoneNumber in DB to mark provider and active status
    await prisma.phoneNumber.update({
      where: { id: phoneNumberId },
      data: {
        provider: "BONVOICE",
        inboundAgentId: agentId,
        direction: "INBOUND",
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ success: true, message: "Inbound route created successfully" });
  } catch (error: any) {
    console.error("Error creating inbound route:", error);
    return NextResponse.json({ error: "Internal Server Error", message: error.message }, { status: 500 });
  }
}
