import Image from "next/image";
import Link from "next/link";

import { BRAND_LOGO } from "@/constants/brand";
import { cn } from "@/lib/utils";

type LogoProps = {
  compact?: boolean;
  className?: string;
};

export function Logo({ compact = false, className }: LogoProps) {
  return (
    <Link
      href="/dashboard"
      aria-label="PropNex AI home"
      className={cn(
        "inline-flex max-w-full shrink-0 items-center transition-opacity hover:opacity-90",
        className
      )}
    >
      <Image
        src={BRAND_LOGO.src}
        alt={BRAND_LOGO.alt}
        width={BRAND_LOGO.width}
        height={BRAND_LOGO.height}
        priority
        className={cn(
          "h-auto w-auto max-w-full object-contain object-left",
          compact ? "max-h-9 sm:max-h-10" : "max-h-11 sm:max-h-12"
        )}
        sizes="(max-width: 768px) 180px, 220px"
      />
    </Link>
  );
}
