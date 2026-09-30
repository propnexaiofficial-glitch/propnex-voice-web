import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { domain, companyName, tabTitle, supportEmail, supportPhone, logoUrl, faviconUrl, instagramUrl, linkedinUrl } = body;

    if (!domain || !companyName || !supportEmail || !logoUrl || !faviconUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if domain already exists
    const existing = await prisma.whiteLabelDomain.findUnique({
      where: { domain }
    });

    if (existing) {
      return NextResponse.json({ error: "This domain is already registered or pending." }, { status: 400 });
    }

    const newDomain = await prisma.whiteLabelDomain.create({
      data: {
        domain,
        companyName,
        tabTitle: tabTitle || companyName,
        supportEmail,
        supportPhone: supportPhone || "",
        logoUrl,
        faviconUrl,
        instagramUrl: instagramUrl || "",
        linkedinUrl: linkedinUrl || "",
        status: "PENDING",
        pagesConfig: JSON.stringify({
          features: true,
          product: true,
          pricing: true,
          docs: true,
          dashboard: true,
          submittedViaForm: true,
          userName: body.name || "User"
        })
      }
    });

    try {
      await prisma.systemEvent.create({
        data: {
          type: "FORM_INFO",
          title: "New White Label Submission",
          message: `${companyName} (${domain}) submitted their branding details.`,
        }
      });
    } catch (e) {
      console.error("Failed to log system event", e);
    }

    const webhookUrl = process.env.GAS_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "white_label_received",
            email: supportEmail,
            userName: body.name || "User",
            domain: domain,
            companyName: companyName,
            supportPhone: supportPhone || "N/A",
            instagramUrl: instagramUrl || "N/A",
            linkedinUrl: linkedinUrl || "N/A",
            tabTitle: tabTitle || companyName
          })
        });
      } catch (err) {
        console.error("Failed to trigger GAS webhook for received:", err);
      }
    }

    return NextResponse.json({ success: true, domain: newDomain });
  } catch (error: any) {
    console.error("White label setup error:", error);
    return NextResponse.json({ error: "Failed to submit white label setup" }, { status: 500 });
  }
}
