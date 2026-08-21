import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "propnex_secret_jwt_key_2026_key";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body as { email: string; password: string };

    if (!email?.trim() || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({ 
      where: { email: normalizedEmail },
      include: {
        companyMembers: {
          where: { status: "ACTIVE" },
          include: { company: { select: { id: true, contractId: true, status: true } } }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    const userAny = user as any;

    if (!userAny.passwordHash) {
      return NextResponse.json(
        { message: "This account uses a different sign-in method. Please contact support." },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, userAny.passwordHash);
    if (!isValid) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    if (userAny.status === "SUSPENDED" || userAny.status === "DEACTIVATED") {
      return NextResponse.json({ message: "Your account has been suspended. Please contact support." }, { status: 403 });
    }

    let companyId: string | null = null;
    let contractId: string | null = null;
    let companyStatus: string | null = null;

    if (userAny.companyMembers && userAny.companyMembers.length > 0) {
      const member = userAny.companyMembers[0];
      if (member?.company) {
        companyId = member.company.id;
        contractId = member.company.contractId;
        companyStatus = member.company.status;
      }
    }

    const accessToken = jwt.sign(
      { sub: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return NextResponse.json({
      accessToken,
      access_token: accessToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: userAny.phone || null,
        companyId,
        contractId,
        companyStatus,
      },
    });
  } catch (err: any) {
    console.error("POST /api/users/signin failed:", err);
    return NextResponse.json({ message: err.message || "Internal server error" }, { status: 500 });
  }
}
