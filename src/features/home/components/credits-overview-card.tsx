"use client";

import { Coins, TrendingUp, Info } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { useEmployeesContext } from "@/features/employees/context/employees-context";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type CreditsOverviewCardProps = {
  className?: string;
};

import { useUserContext } from "@/features/auth/context/user-context";

export function CreditsOverviewCard({ className }: CreditsOverviewCardProps) {
  const { mainBalance, mainUsed } = useUserContext();
  const { companies } = useEmployeesContext();

  const subUsed = companies.reduce((acc, c) => acc + (c.creditsUsed || 0), 0);
  const subRemaining = companies.reduce((acc, c) => acc + (c.creditsRemaining || 0), 0);

  const clampedMainUsed = Math.max(0, mainUsed);
  const clampedSubUsed = Math.max(0, subUsed);
  const totalUsed = clampedMainUsed + clampedSubUsed;

  const totalBalance = mainBalance + subRemaining;
  // Monthly limit = total in-hand + all sub allocations (i.e. grand total before usage)
  const monthlyLimit = Math.max(totalBalance + totalUsed, 1);
  const usagePercent = totalUsed > 0
    ? Math.max(1, Math.min(100, Math.round((totalUsed / monthlyLimit) * 100)))
    : 0;

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
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
            <Coins className="size-4 text-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold">Credit Balance</p>
            <p className="text-xs text-muted-foreground">Your available credits (In-Hand)</p>
          </div>
        </div>

        <div>
          <p className="text-3xl font-bold tracking-tight">
            {mainBalance.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">credits remaining</p>
        </div>

        <div className="grid grid-cols-2 gap-4 rounded-xl border border-border bg-card/50 p-3">
          {/* Assigned (Sub) with info tooltip */}
          <div>
            <div className="flex items-center gap-1">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Assigned (Sub)
              </p>
              {companies.length > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                      <Info className="size-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="start" className="w-[220px] p-3 space-y-1.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Main & Sub-Company Credits
                    </p>
                    {companies.map((c) => (
                      <div key={c.id} className="flex items-center justify-between gap-2">
                        <span className="text-xs text-foreground truncate max-w-[130px]">{c.name}</span>
                        <span className={cn(
                          "text-xs font-semibold tabular-nums shrink-0",
                          (c.creditsRemaining ?? 0) <= 0 ? "text-red-400" : "text-foreground"
                        )}>
                          {(c.creditsRemaining ?? 0).toLocaleString()}
                        </span>
                      </div>
                    ))}
                    <div className="border-t border-border/50 pt-1.5 mt-1.5 flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase text-muted-foreground">Total</span>
                      <span className="text-xs font-bold text-fuchsia-400">{subRemaining.toLocaleString()}</span>
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <p className="mt-1 font-semibold">{subRemaining.toLocaleString()}</p>
          </div>

          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Grand Total</p>
            <p className="mt-1 font-semibold">{totalBalance.toLocaleString()}</p>
          </div>
        </div>

        {/* Monthly usage bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Monthly usage ({totalUsed.toLocaleString()} total used)</span>
            <span className="font-medium text-foreground">{usagePercent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${usagePercent}%` }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
              className={cn(
                "h-full rounded-full",
                usagePercent >= 90 ? "bg-red-500" : usagePercent >= 70 ? "bg-amber-500" : "bg-foreground"
              )}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            <span>Main Used: {clampedMainUsed.toLocaleString()}</span>
            <span>Sub Used: {clampedSubUsed.toLocaleString()}</span>
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
