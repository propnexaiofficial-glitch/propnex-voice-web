import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const jobId = resolvedParams.id;

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: "Missing job ID" },
        { status: 400 }
      );
    }

    const job = await prisma.jobPosting.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json(
        { success: false, error: "Job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, job });
  } catch (error: any) {
    console.error("Failed to fetch job:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch job" },
      { status: 500 }
    );
  }
}
