import { Plus_Jakarta_Sans } from "next/font/google";

import "@/features/landing/landing.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-landing",
});

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`landing-root ${plusJakarta.className}`}>{children}</div>
  );
}
