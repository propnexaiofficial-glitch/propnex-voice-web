import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ message: "Email and OTP are required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    if (user.resetPasswordOtp !== otp) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      return NextResponse.json({ message: "OTP has expired" }, { status: 400 });
    }

    // OTP is valid, but we don't clear it yet so the next step (reset-password) can re-verify it securely
    return NextResponse.json({ message: "OTP verified" }, { status: 200 });
  } catch (err: any) {
    console.error("POST /api/users/verify-otp failed:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
