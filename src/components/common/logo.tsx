import Image from "next/image";
import Link from "next/link";

import { useBrand } from "@/components/providers/brand-provider";
import { BRAND_LOGO } from "@/constants/brand";
import { cn } from "@/lib/utils";

type LogoProps = {
  compact?: boolean;
  className?: string;
};

export function Logo({ compact = false, className }: LogoProps) {
  const brand = useBrand();

  return (
    <Link
      href="/dashboard"
      aria-label={`${brand.companyName || "PropNex AI"} home`}
      className={cn(
        "inline-flex max-w-full shrink-0 items-center transition-opacity hover:opacity-90",
        className
      )}
    >
      <img
        src={brand.logoUrl || BRAND_LOGO.src}
        alt={brand.companyName || BRAND_LOGO.alt}
        width={BRAND_LOGO.width}
        height={BRAND_LOGO.height}
        className={cn(
          "h-auto w-auto max-w-full object-contain object-left",
          compact ? "max-h-9 sm:max-h-10" : "max-h-11 sm:max-h-12"
        )}
      />
    </Link>
  );
}
