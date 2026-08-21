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
    if (!password || password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 });
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ message: "Passwords do not match" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check for duplicate
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ message: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const clerkUserId = `local_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone || null,
        passwordHash,
        clerkUserId,
        status: "ACTIVE",
      } as any,
    });

    // Create PendingApproval so admin panel gets notified
    try {
      await prisma.pendingApproval.create({
        data: { email: normalizedEmail },
      });
    } catch (e) {
      console.warn(`PendingApproval creation skipped: ${e}`);
    }

    // Webhook removed to dramatically improve signup speed (was adding 1000ms+ delay)
    const accessToken = jwt.sign(
      { sub: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return NextResponse.json(
      {
        accessToken,
        access_token: accessToken,
        user: {
          id: newUser.id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          phone: (newUser as any).phone,
          companyId: null,
          contractId: null,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST /api/users/signup failed:", err);
    return NextResponse.json({ message: err.message || "Internal server error" }, { status: 500 });
  }
}
