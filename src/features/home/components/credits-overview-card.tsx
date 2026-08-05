"use client";

import Link from "next/link";
import { Coins, Plus, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { creditsOverview } from "@/features/home/data";
import { cn } from "@/lib/utils";

type CreditsOverviewCardProps = {
  className?: string;
};

export function CreditsOverviewCard({ className }: CreditsOverviewCardProps) {
  const { balance, usedThisMonth, monthlyLimit, usagePercent } = creditsOverview;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.08 }}
      className={cn(
        "glass-card relative overflow-hidden rounded-xl p-6",
        className
      )}
    >
      <div className="relative space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
              <Coins className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Credit Balance</p>
              <p className="text-xs text-muted-foreground">Available credits</p>
            </div>
          </div>
          <Button variant="default" size="sm" asChild>
            <Link href="/dashboard/billing">
              <Plus className="size-3.5" />
              Top Up
            </Link>
          </Button>
        </div>

        <div>
          <p className="text-3xl font-bold tracking-tight">
            {balance.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">credits remaining</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Monthly usage</span>
            <span className="font-medium text-primary">{usagePercent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${usagePercent}%` }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
              className="h-full rounded-full gradient-primary opacity-90"
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{usedThisMonth.toLocaleString()} used</span>
            <span>{monthlyLimit.toLocaleString()} limit</span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-primary/15 bg-primary/5 px-3 py-2">
          <TrendingUp className="size-4 text-primary/80" />
          <p className="text-xs text-muted-foreground">
            Usage is within your monthly plan limits
          </p>
        </div>
      </div>
    </motion.div>
  );
}
