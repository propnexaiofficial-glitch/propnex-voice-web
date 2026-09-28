import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_WEBHOOK_URL || "https://script.google.com/macros/s/AKfycbz2zj_l7vcmiPZKuYqEVdso0apyW3aDJZZWTVTJ1jRrQr8PLGZIH_TzRpTLFskphIwgDQ/exec";

export async function POST(req: NextRequest) {
  try {
    const { email, purpose, domainUrl } = await req.json();

    if (!email?.trim() || !purpose) {
      return NextResponse.json({ message: "Email and purpose are required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordOtp: otp, resetPasswordExpires: expires }
    });

    let webhookType = "password_reset_otp";
    if (purpose === "login-verification") webhookType = "login_otp";
    if (purpose === "signup-verification") webhookType = "signup_otp";

    try {
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: webhookType,
          userEmail: user.email,
          userName: user.firstName || "User",
          otp: otp,
          domainUrl: domainUrl || "https://propnexai.com"
        }),
      });
    } catch (e) {
      console.warn(`Webhook ${webhookType} failed: ${e}`);
    }

    return NextResponse.json({ message: "OTP resent successfully" }, { status: 200 });
  } catch (err: any) {
    console.error("POST /api/users/resend-otp failed:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
