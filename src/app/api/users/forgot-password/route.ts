import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Use the same APPS_SCRIPT_URL used elsewhere
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz2zj_l7vcmiPZKuYqEVdso0apyW3aDJZZWTVTJ1jRrQr8PLGZIH_TzRpTLFskphIwgDQ/exec";

export async function POST(req: NextRequest) {
  try {
    const { email, domainUrl } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Return success even if user not found to prevent email enumeration
      return NextResponse.json({ message: "OTP sent if email exists" }, { status: 200 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordOtp: otp,
        resetPasswordExpires: expires,
      },
    });

    // Send OTP via Apps Script
    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "password_reset_otp",
        userEmail: user.email,
        userName: user.firstName || "User",
        otp: otp,
        domainUrl: domainUrl || "https://propnexai.com"
      })
    });

    return NextResponse.json({ message: "OTP sent" }, { status: 200 });
  } catch (err: any) {
    console.error("POST /api/users/forgot-password failed:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
