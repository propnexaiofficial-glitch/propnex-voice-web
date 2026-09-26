import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ThemeProvider } from "@/features/ui_setup";
import { BrandProvider } from "@/components/providers/brand-provider";
import { getBrandConfig } from "@/lib/brand";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { config, notFound } = await getBrandConfig();
  if (notFound) {
    return { 
      title: "Domain Not Configured",
      icons: [{ url: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22/>" }]
    };
  }
  const titleStr = config.tabTitle || config.companyName;
  return {
    title: {
      default: titleStr,
      template: `%s | ${titleStr}`,
    },
    description: `Enterprise voice AI for inbound and outbound calls. Launch agents, run campaigns, and scale with ${config.companyName}.`,
    icons: config.faviconUrl ? [{ url: config.faviconUrl }] : undefined,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { config, notFound } = await getBrandConfig();
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <BrandProvider initialConfig={config} isNotFound={notFound}>
            {children}
          </BrandProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
