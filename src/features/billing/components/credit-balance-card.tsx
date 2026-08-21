"use client";

import { Coins, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import type { BillingSummary } from "@/features/billing/types";
import { useEmployeesContext } from "@/features/employees/context/employees-context";

type CreditBalanceCardProps = {
  summary: BillingSummary;
  className?: string;
};

export function CreditBalanceCard({ summary, className }: CreditBalanceCardProps) {
  const [mainBalance, setMainBalance] = useState(0);
  const [mainUsed, setMainUsed] = useState(0);
  const { companies } = useEmployeesContext();

  useEffect(() => {
    const syncCredits = () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          if (user.creditBalance) {
            const cb = user.creditBalance;
            setMainBalance(cb.creditsRemaining || 0);
            setMainUsed(cb.creditsUsed || 0);
          }
        }
      } catch (err) {
        console.error("Error parsing user from localStorage", err);
      }
    };

    syncCredits();
    window.addEventListener("user-updated", syncCredits);
    return () => window.removeEventListener("user-updated", syncCredits);
  }, []);

  const subUsed = companies.reduce((acc, c) => acc + (c.creditsUsed || 0), 0);
  const subRemaining = companies.reduce((acc, c) => acc + (c.creditsRemaining || 0), 0);
  
  const clampedMainUsed = Math.max(0, mainUsed);
  const clampedSubUsed = Math.max(0, subUsed);

  // We still use summary.balance and summary.usedThisMonth for consistency, but we break it down
  const clampedUsed = Math.max(0, summary.usedThisMonth);
  const usagePercent = Math.min(100, Math.round(
    (clampedUsed / summary.monthlyLimit) * 100
  ));

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
            <p className="text-xs text-muted-foreground">Total available credits</p>
          </div>
        </div>

        <div>
          <p className="text-4xl font-bold tracking-tight">
            {summary.balance.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">credits remaining</p>
        </div>

        <div className="grid grid-cols-2 gap-4 rounded-xl border border-border bg-card/50 p-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">In Hand (Main)</p>
            <p className="mt-1 font-semibold">{mainBalance.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Assigned (Sub)</p>
            <p className="mt-1 font-semibold">{subRemaining.toLocaleString()}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Monthly usage ({clampedUsed.toLocaleString()} total used)</span>
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
