import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const host = req.headers.get("host") || "";
    // Remove port if exists (e.g., localhost:3000 -> localhost)
    const domain = host.split(":")[0];
    
    // We try exact match first
    let config = await prisma.whiteLabelDomain.findUnique({
      where: { domain },
    });

    // If local dev, just fallback to empty/default for local testing if not found
    if (!config && (domain === "localhost" || domain === "127.0.0.1")) {
      return NextResponse.json({});
    }

    if (!config) {
      return NextResponse.json({});
    }

    return NextResponse.json({
      companyName: config.companyName,
      logoUrl: config.logoUrl,
      faviconUrl: config.faviconUrl,
      instagramUrl: config.instagramUrl,
      linkedinUrl: config.linkedinUrl,
      pagesConfig: config.pagesConfig || {},
    });
  } catch (err) {
    console.error("Failed to fetch brand config", err);
    return NextResponse.json({});
  }
}
