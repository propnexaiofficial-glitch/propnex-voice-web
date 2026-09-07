import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      jobId,
      firstName,
      lastName,
      email,
      phone,
      experience,
      expectedPayout,
      resumeUrl,
    } = data;

    if (!jobId || !firstName || !email) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const application = await prisma.jobApplication.create({
      data: {
        jobId,
        firstName,
        lastName,
        email,
        phone: phone || "",
        experience: experience || "",
        expectedPayout: expectedPayout || "",
        resumeUrl: resumeUrl || "",
      },
    });

    return NextResponse.json({ success: true, data: application });
  } catch (error: any) {
    console.error("Failed to submit job application:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit job application" },
      { status: 500 }
    );
  }
}
