"use client";

import { Coins, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { useEmployeesContext } from "@/features/employees/context/employees-context";

type CreditsOverviewCardProps = {
  className?: string;
};

export function CreditsOverviewCard({ className }: CreditsOverviewCardProps) {
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

    syncCredits(); // initial load
    window.addEventListener("user-updated", syncCredits);
    return () => window.removeEventListener("user-updated", syncCredits);
  }, []);

  const subUsed = companies.reduce((acc, c) => acc + (c.creditsUsed || 0), 0);
  const subRemaining = companies.reduce((acc, c) => acc + (c.creditsRemaining || 0), 0);
  
  // To avoid showing negative usages in the UI, we clamp them to 0 minimum.
  const clampedMainUsed = Math.max(0, mainUsed);
  const clampedSubUsed = Math.max(0, subUsed);

  const totalBalance = mainBalance + subRemaining;
  const totalUsed = clampedMainUsed + clampedSubUsed;
  const monthlyLimit = 10000;
  
  const usagePercent = totalUsed > 0 ? Math.max(1, Math.min(100, Math.round((totalUsed / monthlyLimit) * 100))) : 0;

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
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Assigned (Sub)</p>
            <p className="mt-1 font-semibold">{subRemaining.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Grand Total</p>
            <p className="mt-1 font-semibold">{totalBalance.toLocaleString()}</p>
          </div>
        </div>

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
              className="h-full rounded-full bg-foreground"
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            <span>Main Used: {clampedMainUsed.toLocaleString()}</span>
            <span>Sub Used: {clampedSubUsed.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
