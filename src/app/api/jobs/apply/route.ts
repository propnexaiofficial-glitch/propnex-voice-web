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
      countryCode,
      phone,
      experience,
      expectedPayout,
      currentPayout,
      sponsor,
      legalStatus,
      citizenship,
      gender,
      agreedToTerms,
    } = data;

    if (!jobId || !firstName || !email || !agreedToTerms) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const jobPosting = await prisma.jobPosting.findUnique({
      where: { id: jobId }
    });

    if (!jobPosting) {
      return NextResponse.json(
        { success: false, error: "Job posting not found" },
        { status: 404 }
      );
    }

    // Check for duplicate application
    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        jobId,
        email: email.toLowerCase()
      }
    });

    if (existingApplication) {
      return NextResponse.json(
        { success: false, error: "You have already applied for this job with this email address." },
        { status: 409 }
      );
    }

    const jobTitle = jobPosting.title;

    // 1. Submit to Apps Script
    const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyi8J3eJz2-O_4-pM0aZ8g-0a3j8UuS4fK77G2kR0e2C1g9fF4619iK2840tF_XjH0y/exec";
    const scriptPayload = {
      type: "job_application",
      jobId,
      jobTitle,
      firstName,
      lastName,
      email,
      countryCode,
      phone,
      experience,
      expectedPayout,
      currentPayout,
      sponsor,
      legalStatus,
      citizenship,
      gender,
      agreedToTerms,
      fileBase64: data.fileData,
      fileName: data.fileName,
      mimeType: data.mimeType
    };

    const scriptRes = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(scriptPayload)
    });
    
    let resumeUrl = "";
    try {
      const scriptData = await scriptRes.json();
      if (scriptData.success) {
        resumeUrl = scriptData.fileUrl || "";
      }
    } catch (e) {
      console.error("Apps script error", e);
    }

    // 2. Save to Database
    const application = await prisma.jobApplication.create({
      data: {
        jobId,
        firstName,
        lastName,
        email: email.toLowerCase(),
        countryCode: countryCode || "",
        phone: phone || "",
        experience: experience || "",
        expectedPayout: expectedPayout || "",
        currentPayout: currentPayout || "",
        sponsor: sponsor || "",
        legalStatus: legalStatus || "",
        citizenship: citizenship || "",
        gender: gender || "",
        agreedToTerms: agreedToTerms || false,
        resumeUrl,
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
