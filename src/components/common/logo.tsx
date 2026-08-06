import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

const LOGO_SRC = "/propnex-logo-dashboard.png";

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
        src={LOGO_SRC}
        alt="PropNex AI"
        width={1024}
        height={341}
        priority
        className={cn(
          "h-auto w-auto max-w-full object-contain object-left",
          compact ? "max-h-7" : "max-h-9 sm:max-h-10"
        )}
        sizes="(max-width: 768px) 160px, 200px"
      />
    </Link>
  );
}
