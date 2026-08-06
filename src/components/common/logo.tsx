import Image from "next/image";
import Link from "next/link";

import { APP_NAME, APP_TAGLINE } from "@/constants/navigation";
import { cn } from "@/lib/utils";

type LogoProps = {
  compact?: boolean;
  className?: string;
};

export function Logo({ compact = false, className }: LogoProps) {
  return (
    <Link
      href="/dashboard"
      className={cn("flex items-center gap-3 transition-opacity hover:opacity-90", className)}
    >
      <Image
        src="/propnex-logo-cropped.png"
        alt={APP_NAME}
        width={140}
        height={36}
        className={cn("h-9 w-auto object-contain", compact && "h-8")}
        priority
      />
      {!compact && (
        <p className="truncate text-xs text-muted-foreground">{APP_TAGLINE}</p>
      )}
    </Link>
  );
}
