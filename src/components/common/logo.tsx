import Link from "next/link";
import { Mic2 } from "lucide-react";

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
      <div className="flex size-10 items-center justify-center rounded-xl gradient-primary glow-purple shadow-lg">
        <Mic2 className="size-5 text-white" />
      </div>
      {!compact && (
        <div className="min-w-0">
          <p className="truncate text-base font-bold tracking-tight text-foreground">
            {APP_NAME}
          </p>
          <p className="truncate text-xs text-muted-foreground">{APP_TAGLINE}</p>
        </div>
      )}
    </Link>
  );
}
