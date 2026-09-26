import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { WhiteLabelConfig } from "@/components/providers/brand-provider";

const defaultBrand: WhiteLabelConfig = {
  companyName: "PropNex AI",
  logoUrl: "/propnex-logo.png",
  faviconUrl: "/favicon.ico",
  instagramUrl: null,
  linkedinUrl: null,
  supportEmail: "support@propnexai.com",
  supportPhone: "+91 9889479110",
  pagesConfig: {},
};

export const getFullUrl = (url?: string | null): string | null => {
  if (!url) return null;
  return url;
};

export async function getBrandConfig(): Promise<{ config: WhiteLabelConfig; notFound: boolean }> {
  try {
    const headersList = await headers();
    const host = headersList.get("host") || "";
    const domain = host.split(":")[0];
    
    // High-end validation: ALWAYS protect the main domain
    if (domain === "propnexai.com" || domain === "www.propnexai.com" || domain.includes("propnex")) {
      return { config: defaultBrand, notFound: false };
    }
    
    let config = await prisma.whiteLabelDomain.findUnique({
      where: { domain },
    });

    if (!config) {
      const alternateDomain = domain.startsWith("www.") ? domain.replace("www.", "") : `www.${domain}`;
      config = await prisma.whiteLabelDomain.findUnique({
        where: { domain: alternateDomain },
      });
    }

    if (!config && (domain === "localhost" || domain === "127.0.0.1")) {
      return { config: defaultBrand, notFound: false };
    }

    if (!config) {
      return { config: defaultBrand, notFound: true };
    }

    return {
      config: {
        companyName: config.companyName,
        logoUrl: getFullUrl(config.logoUrl),
        faviconUrl: getFullUrl(config.faviconUrl),
        instagramUrl: config.instagramUrl,
        linkedinUrl: config.linkedinUrl,
        supportEmail: config.supportEmail,
        supportPhone: config.supportPhone || undefined,
        tabTitle: config.tabTitle || undefined,
        domain: config.domain,
        pagesConfig: (config.pagesConfig as Record<string, boolean>) || {},
      },
      notFound: false
    };
  } catch (err) {
    console.error("Failed to fetch brand config in SSR", err);
    return { config: defaultBrand, notFound: false };
  }
}
