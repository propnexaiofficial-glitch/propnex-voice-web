"use client";

import Link from "next/link";
import { Coins, Plus } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { mockUser } from "@/data/mock-user";
import { cn } from "@/lib/utils";

type CreditsWidgetProps = {
  variant?: "header" | "sidebar";
  className?: string;
};

export function CreditsWidget({
  variant = "header",
  className,
}: CreditsWidgetProps) {
  const formattedCredits = mockUser.credits.toLocaleString();

  if (variant === "sidebar") {
    return (
      <div
        className={cn(
          "glass-card rounded-xl p-4 space-y-3",
          className
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            Daily AI Usage
          </span>
          <span className="text-xs font-semibold text-primary">
            {mockUser.creditsUsagePercent}%
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-primary/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${mockUser.creditsUsagePercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full gradient-primary opacity-90"
          />
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            <Coins className="size-3.5 text-primary" />
            <span className="text-sm font-semibold">{formattedCredits}</span>
          </div>
          <Button variant="default" size="sm" asChild>
            <Link href="/dashboard/billing">
              <Plus className="size-3.5" />
              Top Up
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Link
      href="/dashboard/billing"
      className={cn(
        "group hidden items-center gap-3 rounded-full border border-border bg-primary/5 px-3 py-2 transition-all hover:border-primary/25 hover:bg-primary/10 md:flex",
        className
      )}
    >
      <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
        <Coins className="size-4 text-primary" />
      </div>
      <div className="text-left">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Credits
        </p>
        <p className="text-sm font-semibold leading-none">{formattedCredits}</p>
      </div>
      <Plus className="size-4 text-primary/70 transition-colors group-hover:text-primary" />
    </Link>
  );
}
