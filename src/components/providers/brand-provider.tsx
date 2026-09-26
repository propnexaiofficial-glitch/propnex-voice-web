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
  const [isNotFound, setIsNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetch("/api/brand")
      .then(res => res.json())
      .then(data => {
        if (data && data.notFound) {
          setIsNotFound(true);
          setIsLoading(false);
          return;
        }
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
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

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

  // Prevent flash of PropNex AI content on a custom domain before brand is fetched
  if (isLoading) {
    return <div className="min-h-screen bg-black" />; // simple black background while loading
  }

  return (
    <BrandContext.Provider value={config}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  return useContext(BrandContext);
}
