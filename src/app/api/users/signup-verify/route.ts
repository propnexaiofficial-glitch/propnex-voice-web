import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "propnex_secret_jwt_key_2026_key";
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_WEBHOOK_URL || "https://script.google.com/macros/s/AKfycbz2zj_l7vcmiPZKuYqEVdso0apyW3aDJZZWTVTJ1jRrQr8PLGZIH_TzRpTLFskphIwgDQ/exec";

export async function POST(req: NextRequest) {
  try {
    const { email, otp, domainUrl } = await req.json();

    if (!email?.trim() || !otp) {
      return NextResponse.json({ message: "Email and OTP are required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      return NextResponse.json({ message: "Invalid email or OTP" }, { status: 401 });
    }

    if (user.resetPasswordOtp !== otp) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 401 });
    }

    if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      return NextResponse.json({ message: "OTP has expired" }, { status: 401 });
    }

    // Activate User and clear OTP
    const activatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { status: "ACTIVE", resetPasswordOtp: null, resetPasswordExpires: null }
    });

    // Create PendingApproval so admin panel gets notified
    try {
      await prisma.pendingApproval.create({
        data: { email: normalizedEmail },
      });
    } catch (e) {
      console.warn(`PendingApproval creation skipped: ${e}`);
    }

    // System Event
    const domain = domainUrl ? new URL(domainUrl).hostname : "propnexai.com";
    await (prisma as any).systemEvent.create({
      data: {
        type: "USER_SIGNUP",
        title: "New User Registered",
        message: `${activatedUser.email} signed up via domain ${domain}`,
        payload: { email: activatedUser.email, domain: domain }
      }
    }).catch((e: any) => console.error("Failed to log system event", e));

    // Fetch branding for webhook
    const host = domain;
    let branding = undefined;
    if (host) {
      try {
        const domainRecord = await prisma.whiteLabelDomain.findFirst({
          where: { domain: host, status: "ACTIVE" }
        });
        if (domainRecord) {
          branding = {
            companyName: domainRecord.companyName,
            supportEmail: domainRecord.supportEmail,
            supportPhone: domainRecord.supportPhone,
            domain: domainRecord.domain
          };
        }
      } catch (err) {}
    }

    // Trigger Google Apps Script Webhook for New Registration (Thanks email) - NON BLOCKING
    fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "new_registration",
        name: `${activatedUser.firstName} ${activatedUser.lastName}`.trim(),
        email: normalizedEmail,
        branding: branding,
      }),
    }).catch(e => console.warn(`Webhook new_registration failed: ${e}`));

    const accessToken = jwt.sign(
      { sub: activatedUser.id, email: activatedUser.email },
      JWT_SECRET,
      { expiresIn: "365d" }
    );

    return NextResponse.json({
      accessToken,
      access_token: accessToken,
      user: {
        id: activatedUser.id,
        firstName: activatedUser.firstName,
        lastName: activatedUser.lastName,
        email: activatedUser.email,
        phone: (activatedUser as any).phone || null,
        companyId: null,
        contractId: null,
      },
    });
  } catch (err: any) {
    console.error("POST /api/users/signup-verify failed:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
