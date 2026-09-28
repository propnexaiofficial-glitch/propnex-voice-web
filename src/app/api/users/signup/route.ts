import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "propnex_secret_jwt_key_2026_key";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, phone, password, confirmPassword } = body as {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      password: string;
      confirmPassword: string;
    };

    // Validate inputs
    if (!firstName?.trim() || !lastName?.trim()) {
      return NextResponse.json({ message: "First and last name are required" }, { status: 400 });
    }
    if (!email?.trim()) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }
    if (!password) {
      return NextResponse.json({ message: "Password is required" }, { status: 400 });
    }
    
    // Strict password policy: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json({ message: "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a symbol." }, { status: 400 });
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ message: "Passwords do not match" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const passwordHash = await bcrypt.hash(password, 10);
    const clerkUserId = `local_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    let userToUse;
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    
    if (existingUser) {
      if (existingUser.status === "ACTIVE" || existingUser.status === "SUSPENDED") {
        return NextResponse.json({ message: "Email already registered" }, { status: 409 });
      }
      
      // Update existing deactivated user
      userToUse = await prisma.user.update({
        where: { email: normalizedEmail },
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone || null,
          passwordHash,
        }
      });
    } else {
      userToUse = await prisma.user.create({
        data: {
          email: normalizedEmail,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone || null,
          passwordHash,
          clerkUserId,
          status: "DEACTIVATED",
        } as any,
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: userToUse.id },
      data: { resetPasswordOtp: otp, resetPasswordExpires: expires }
    });

    const host = req.headers.get("host") || "";
    let domainUrl = "https://propnexai.com";
    let branding = undefined;
    if (host) {
      try {
        const domainRecord = await prisma.whiteLabelDomain.findFirst({
          where: { domain: host, status: "ACTIVE" }
        });
        if (domainRecord) {
          domainUrl = "https://" + domainRecord.domain;
          branding = {
            companyName: domainRecord.companyName,
            supportEmail: domainRecord.supportEmail,
            supportPhone: domainRecord.supportPhone,
            domain: domainRecord.domain
          };
        }
      } catch (err) {}
    }

    const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_WEBHOOK_URL || "https://script.google.com/macros/s/AKfycbz2zj_l7vcmiPZKuYqEVdso0apyW3aDJZZWTVTJ1jRrQr8PLGZIH_TzRpTLFskphIwgDQ/exec";
    
    // Trigger Google Apps Script Webhook - NON BLOCKING
    fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "signup_otp",
        userEmail: userToUse.email,
        userName: userToUse.firstName || "User",
        otp: otp,
        domainUrl: domainUrl,
        branding: branding
      }),
    }).catch(e => console.warn(`Webhook signup_otp failed: ${e}`));

    return NextResponse.json({ message: "OTP required", requireOtp: true }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/users/signup failed:", err);
    return NextResponse.json({ message: err.message || "Internal server error" }, { status: 500 });
  }
}
