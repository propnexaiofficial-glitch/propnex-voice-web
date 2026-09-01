import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { formType, name, email, phone, company, industry, clients, volume } = body;

    if (!formType || !name || !email || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (formType !== "DEMO_CALL" && formType !== "PARTNER_APP") {
      return NextResponse.json({ error: "Invalid form type" }, { status: 400 });
    }

    // Save to database
    const formSubmission = await prisma.formSubmission.create({
      data: {
        formType,
        name,
        email,
        phone,
        company,
        industry,
        clients,
        volume,
      },
    });

    // Trigger webhook email
    const webhookUrl = process.env.APPS_SCRIPT_WEBHOOK_URL;
    if (webhookUrl) {
      const webhookPayload = {
        type: formType === "DEMO_CALL" ? "demo_call_submit" : "partner_app_submit",
        name,
        email,
        phone,
        company,
        industry,
        clients,
        volume,
      };

      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(webhookPayload),
      }).catch(err => {
        console.error("Failed to send webhook:", err);
      });
    }

    return NextResponse.json({ success: true, id: formSubmission.id });
  } catch (error) {
    console.error("Form submission error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
