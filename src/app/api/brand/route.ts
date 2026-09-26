import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const host = req.headers.get("host") || "";
    // Remove port if exists (e.g., localhost:3000 -> localhost)
    const domain = host.split(":")[0];
    
    // High-end validation: ALWAYS protect the main domain
    if (domain === "propnexai.com" || domain === "www.propnexai.com") {
      return NextResponse.json({});
    }
    
    // We try exact match first
    let config = await prisma.whiteLabelDomain.findUnique({
      where: { domain },
    });

    // If not found, try adding or removing 'www.'
    if (!config) {
      const alternateDomain = domain.startsWith("www.") ? domain.replace("www.", "") : `www.${domain}`;
      config = await prisma.whiteLabelDomain.findUnique({
        where: { domain: alternateDomain },
      });
    }

    if (!config && (domain === "localhost" || domain === "127.0.0.1" || domain.includes("propnex"))) {
      return NextResponse.json({});
    }

    if (!config) {
      return NextResponse.json({ notFound: true });
    }

    return NextResponse.json({
      companyName: config.companyName,
      logoUrl: config.logoUrl,
      faviconUrl: config.faviconUrl,
      instagramUrl: config.instagramUrl,
      linkedinUrl: config.linkedinUrl,
      supportEmail: config.supportEmail,
      supportPhone: config.supportPhone,
      pagesConfig: config.pagesConfig || {},
    });
  } catch (err) {
    console.error("Failed to fetch brand config", err);
    return NextResponse.json({});
  }
}
