"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

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

const getFullUrl = (url?: string | null) => {
  if (!url) return url;
  if (url.startsWith("/uploads/")) {
    const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || "https://admin.propnexai.com";
    return `${adminUrl}${url}`;
  }
  return url;
};

const BrandContext = createContext<WhiteLabelConfig>(defaultBrand);

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<WhiteLabelConfig>(defaultBrand);
  
  useEffect(() => {
    fetch("/api/brand")
      .then(res => res.json())
      .then(data => {
        if (data && data.companyName) {
          const formattedData = {
            ...data,
            logoUrl: getFullUrl(data.logoUrl),
            faviconUrl: getFullUrl(data.faviconUrl)
          };
          setConfig(formattedData);
          if (formattedData.faviconUrl) {
            const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
            if (link) {
              link.href = formattedData.faviconUrl;
            } else {
              const newLink = document.createElement("link");
              newLink.rel = "icon";
              newLink.href = formattedData.faviconUrl;
              document.head.appendChild(newLink);
            }
          }
          if (formattedData.companyName) {
            const targetTitle = formattedData.tabTitle || formattedData.companyName;
            document.title = targetTitle;
            
            // Force title to remain custom title across Next.js route changes
            const observer = new MutationObserver(() => {
              if (document.title !== targetTitle && !document.title.includes(targetTitle)) {
                document.title = targetTitle;
              }
            });
            const titleNode = document.querySelector("title");
            if (titleNode) {
              observer.observe(titleNode, { childList: true });
            }
          }
        }
      })
      .catch(console.error);
  }, []);

  return (
    <BrandContext.Provider value={config}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  return useContext(BrandContext);
}
