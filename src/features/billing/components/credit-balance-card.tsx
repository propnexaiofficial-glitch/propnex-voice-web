"use client";

import { Coins, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import type { BillingSummary } from "@/features/billing/types";

type CreditBalanceCardProps = {
  summary: BillingSummary;
  className?: string;
};

export function CreditBalanceCard({ summary, className }: CreditBalanceCardProps) {
  const usagePercent = Math.round(
    (summary.usedThisMonth / summary.monthlyLimit) * 100
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "glass-card relative overflow-hidden rounded-lg p-6",
        className
      )}
    >
      <div className="relative space-y-5">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
            <Coins className="size-4 text-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold">Credit Balance</p>
            <p className="text-xs text-muted-foreground">Available credits</p>
          </div>
        </div>

        <div>
          <p className="text-4xl font-bold tracking-tight">
            {summary.balance.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">credits remaining</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Monthly usage</span>
            <span className="font-medium text-foreground">{usagePercent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${usagePercent}%` }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.15 }}
              className="h-full rounded-full bg-foreground"
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{summary.usedThisMonth.toLocaleString()} used</span>
            <span>{summary.monthlyLimit.toLocaleString()} limit</span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2">
          <TrendingUp className="size-4 shrink-0 text-emerald-400" />
          <p className="text-xs text-emerald-400">
            Usage is within your monthly plan limits
          </p>
        </div>
      </div>
    </motion.div>
  );
}
