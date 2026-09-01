import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const WEBHOOK_URL =
  process.env.APPS_SCRIPT_WEBHOOK_URL ||
  "https://script.google.com/macros/s/AKfycbz2zj_l7vcmiPZKuYqEVdso0apyW3aDJZZWTVTJ1jRrQr8PLGZIH_TzRpTLFskphIwgDQ/exec";

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

    // 1. Save to database
    const formSubmission = await prisma.formSubmission.create({
      data: { formType, name, email, phone, company, industry, clients, volume },
    });

    // 2. Send emails via Google Apps Script webhook
    // The apps_script_emails.js doPost() uses exactly these field names
    const webhookPayload = {
      type: formType === "DEMO_CALL" ? "demo_call_submit" : "partner_app_submit",
      name,
      email,
      phone,
      company: company || "",
      industry: industry || "",
      clients: clients || "",
      volume: volume || "",
    };

    try {
      const webhookRes = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(webhookPayload),
        signal: AbortSignal.timeout(12000),
      });
      const webhookText = await webhookRes.text();
      console.log("[forms] Webhook response:", webhookText);
    } catch (webhookErr) {
      // Email failure should NOT block the user's form submission response
      console.error("[forms] Webhook email failed:", webhookErr);
    }

    return NextResponse.json({ success: true, id: formSubmission.id });
  } catch (error) {
    console.error("Form submission error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
