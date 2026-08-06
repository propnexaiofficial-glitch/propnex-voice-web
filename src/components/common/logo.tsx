import Link from "next/link";

import { cn } from "@/lib/utils";

type LogoProps = {
  compact?: boolean;
  className?: string;
};

export function Logo({ compact = false, className }: LogoProps) {
  return (
    <Link
      href="/dashboard"
      className={cn(
        "inline-flex shrink-0 items-center transition-opacity hover:opacity-90",
        className
      )}
    >
      <span
        className={cn(
          "brand-logo-text font-bold tracking-tight",
          compact ? "text-base" : "text-lg md:text-xl"
        )}
      >
        PropNex AI
      </span>
    </Link>
  );
}
