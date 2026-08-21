"use client";

import Link from "next/link";
import { Coins, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CreditsWidgetProps = {
  variant?: "header" | "sidebar";
  className?: string;
};

export function CreditsWidget({
  variant = "header",
  className,
}: CreditsWidgetProps) {
  const [balance, setBalance] = useState(0);
  const [usagePercent, setUsagePercent] = useState(0);

  useEffect(() => {
    const fetchCredits = () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          if (user.creditBalance) {
            const rem = user.creditBalance.creditsRemaining || 0;
            const used = user.creditBalance.creditsUsed || 0;
            setBalance(rem);
            const limit = 10000;
            setUsagePercent(Math.min(100, Math.round((used / limit) * 100)));
          }
        }
      } catch (e) {}
    };

    fetchCredits();
    window.addEventListener("user-updated", fetchCredits);
    return () => window.removeEventListener("user-updated", fetchCredits);
  }, []);

  const formattedCredits = balance.toLocaleString();

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
          <span className="text-xs font-semibold text-foreground">
            {usagePercent}%
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${usagePercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full bg-foreground"
          />
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            <Coins className="size-3.5 text-muted-foreground" />
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
        "group hidden items-center gap-3 rounded-md border border-border bg-card px-3 py-2 transition-all hover:bg-accent md:flex",
        className
      )}
    >
      <div className="flex size-8 items-center justify-center rounded-md bg-muted">
        <Coins className="size-4 text-foreground" />
      </div>
      <div className="text-left">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Credits
        </p>
        <p className="text-sm font-semibold leading-none">{formattedCredits}</p>
      </div>
      <Plus className="size-4 text-muted-foreground transition-colors group-hover:text-foreground" />
    </Link>
  );
}
