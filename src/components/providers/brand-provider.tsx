"use client";

import React, { createContext, useContext, useEffect } from "react";

export type WhiteLabelConfig = {
  companyName: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  instagramUrl: string | null;
  linkedinUrl: string | null;
  supportEmail?: string;
  supportPhone?: string;
  tabTitle?: string;
  domain?: string;
  pagesConfig: Record<string, boolean>;
};

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

export const getFullUrl = (url?: string | null) => {
  if (!url) return url;
  return url;
};

const BrandContext = createContext<WhiteLabelConfig>(defaultBrand);

export function BrandProvider({ 
  children,
  initialConfig,
  isNotFound
}: { 
  children: React.ReactNode;
  initialConfig: WhiteLabelConfig;
  isNotFound: boolean;
}) {
  useEffect(() => {
    if (initialConfig.faviconUrl && !isNotFound) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = initialConfig.faviconUrl;
    }
  }, [initialConfig, isNotFound]);

  if (isNotFound) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white px-4 text-center">
        <h1 className="text-4xl font-bold mb-2">404 - Domain Not Configured</h1>
        <p className="text-white/60 mb-8 max-w-md">
          This domain is not currently configured or active on our platform. Please contact the platform administrator to finish the setup.
        </p>
      </div>
    );
  }

  return (
    <BrandContext.Provider value={initialConfig}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  return useContext(BrandContext);
}
