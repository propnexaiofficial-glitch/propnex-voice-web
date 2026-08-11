"use client";

import { Coins, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

import { creditsOverview } from "@/features/home/data";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type CreditsOverviewCardProps = {
  className?: string;
};

export function CreditsOverviewCard({ className }: CreditsOverviewCardProps) {
  const [balance, setBalance] = useState(0);
  const [usedThisMonth, setUsedThisMonth] = useState(0);
  const [monthlyLimit, setMonthlyLimit] = useState(10000);
  const [usagePercent, setUsagePercent] = useState(0);

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const token = localStorage.getItem("accessToken") || localStorage.getItem("access_token");
        if (!token) return;

        const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const response = await fetch(`${apiBase}/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.user && data.user.creditBalance) {
            // Update localStorage just to keep it in sync
            localStorage.setItem("user", JSON.stringify(data.user));
            
            const cb = data.user.creditBalance;
            setBalance(cb.creditsRemaining || 0);
            setUsedThisMonth(cb.creditsUsed || 0);
            const limit = 10000;
            setMonthlyLimit(limit);
            setUsagePercent(Math.min(100, Math.round(((cb.creditsUsed || 0) / limit) * 100)));
          }
        }
      } catch (err) {
        // Fallback to local storage on error
        try {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            const user = JSON.parse(storedUser);
            if (user.creditBalance) {
              setBalance(user.creditBalance.creditsRemaining || 0);
              setUsedThisMonth(user.creditBalance.creditsUsed || 0);
            }
          }
        } catch(e) {}
      }
    };

    fetchCredits(); // initial load
    const interval = setInterval(fetchCredits, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

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
            <p className="text-xs text-muted-foreground">Available credits</p>
          </div>
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
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{usedThisMonth.toLocaleString()} used</span>
            <span>{monthlyLimit.toLocaleString()} limit</span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
          <TrendingUp className="size-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Usage is within your monthly plan limits
          </p>
        </div>
      </div>
    </motion.div>
  );
}
