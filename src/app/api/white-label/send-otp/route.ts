import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Send it to GAS Webhook
    const webhookUrl = process.env.GAS_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "white_label_otp",
            email: email,
            userName: name || "User",
            otp: otp
          })
        });
      } catch (err) {
        console.error("Failed to send OTP via GAS webhook:", err);
      }
    } else {
      console.warn("GAS_WEBHOOK_URL not set in propnex-voice-web");
    }

    // Return the expected OTP to the frontend so it can verify the user input
    return NextResponse.json({ success: true, otp });

  } catch (error: any) {
    console.error("Send OTP error:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
