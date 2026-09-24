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

const BrandContext = createContext<WhiteLabelConfig>(defaultBrand);

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<WhiteLabelConfig>(defaultBrand);
  
  useEffect(() => {
    fetch("/api/brand")
      .then(res => res.json())
      .then(data => {
        if (data && data.companyName) {
          setConfig(data);
          if (data.faviconUrl) {
            const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
            if (link) {
              link.href = data.faviconUrl;
            } else {
              const newLink = document.createElement("link");
              newLink.rel = "icon";
              newLink.href = data.faviconUrl;
              document.head.appendChild(newLink);
            }
          }
          if (data.companyName) {
            document.title = document.title.replace("PropNex AI", data.companyName);
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
