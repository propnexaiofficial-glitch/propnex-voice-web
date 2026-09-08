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
      },
      orderBy: {
        appliedAt: 'desc'
      }
    });

    if (existingApplication && existingApplication.status !== "REJECTED") {
      return NextResponse.json(
        { 
          success: false, 
          error: existingApplication.status === "ACCEPTED" 
            ? "You have already been accepted for this position." 
            : "You have already applied for this job and it is currently under review." 
        },
        { status: 409 }
      );
    }

    const jobTitle = jobPosting.title;

    // 1. Submit to Apps Script
    const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz2zj_l7vcmiPZKuYqEVdso0apyW3aDJZZWTVTJ1jRrQr8PLGZIH_TzRpTLFskphIwgDQ/exec";
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
      fileData: data.fileData,
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
      if (scriptData.status === "success") {
        resumeUrl = scriptData.message?.resumeUrl || "";
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
