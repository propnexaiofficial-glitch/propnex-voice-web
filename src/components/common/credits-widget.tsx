"use client";

import Link from "next/link";
import { Coins, Plus, Building2, User } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState, useCallback } from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEmployeesContext } from "@/features/employees/context/employees-context";
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
  const [mainUsed, setMainUsed] = useState(0);
  const { companies, refreshCompanies } = useEmployeesContext();

  // ── Read from localStorage AND re-fetch from server ──────────────────────
  const syncCredits = useCallback(async () => {
    // 1. Immediately show cached value
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.creditBalance) {
          setBalance(user.creditBalance.creditsRemaining || 0);
          setMainUsed(user.creditBalance.creditsUsed || 0);
        }
      }
    } catch (e) {}

    // 2. Fetch fresh from server and update localStorage + state
    try {
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (res.ok) {
        const fresh = await res.json();
        localStorage.setItem("user", JSON.stringify(fresh));
        if (fresh.creditBalance) {
          setBalance(fresh.creditBalance.creditsRemaining || 0);
          setMainUsed(fresh.creditBalance.creditsUsed || 0);
        }
        // Also refresh sub-company list so their credits update too
        if (refreshCompanies) refreshCompanies(true);
        window.dispatchEvent(new Event("user-updated"));
      }
    } catch (e) {
      console.error("Failed to sync credits", e);
    }
  }, [refreshCompanies]);

  useEffect(() => {
    // Initial load
    syncCredits();

    // Refresh on window focus (when admin comes back from admin panel)
    const onFocus = () => syncCredits();
    window.addEventListener("focus", onFocus);

    // Refresh every 60 seconds
    const interval = setInterval(syncCredits, 60_000);

    // Refresh on custom events
    const onUserUpdated = () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          if (user.creditBalance) {
            setBalance(user.creditBalance.creditsRemaining || 0);
            setMainUsed(user.creditBalance.creditsUsed || 0);
          }
        }
      } catch (e) {}
    };
    window.addEventListener("user-updated", onUserUpdated);

    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("user-updated", onUserUpdated);
      clearInterval(interval);
    };
  }, [syncCredits]);

  const totalSubCompanyCredits = companies.reduce((acc, c) => acc + (c.creditsRemaining || 0), 0);
  const grandTotal = balance + totalSubCompanyCredits;

  const totalSubCompanyUsed = companies.reduce((acc, c) => acc + (c.creditsUsed || 0), 0);
  const grandUsed = Math.max(0, mainUsed) + Math.max(0, totalSubCompanyUsed);
  const limit = 10000;
  const usagePercent = grandUsed > 0 ? Math.max(1, Math.min(100, Math.round((grandUsed / limit) * 100))) : 0;

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

  const widgetContent = (
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

  return (
    <Tooltip>
      <TooltipTrigger asChild>{widgetContent}</TooltipTrigger>
      <TooltipContent side="bottom" align="end" className="w-[280px] p-0 glass-card">
        <div className="p-3 border-b border-border/50">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sub-Company Credits</h4>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          <div className="flex flex-col">
            {/* Main account row */}
            <div className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors border-b border-border/50">
              <div className="flex items-center gap-2 overflow-hidden mr-3">
                <User className="size-3.5 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium truncate">Main Account</span>
              </div>
              <div className={cn(
                "flex items-center gap-1.5 text-xs font-semibold shrink-0 bg-background px-2 py-1 rounded-md border border-border",
                balance <= 0 && "text-red-500 border-red-500/20 bg-red-500/10"
              )}>
                <Coins className="size-3 opacity-70" />
                <span>{balance.toLocaleString()}</span>
              </div>
            </div>

            {/* Sub-company rows */}
            {companies.map((company) => (
              <div key={company.id} className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors border-b border-border/50">
                <div className="flex items-center gap-2 overflow-hidden mr-3">
                  <Building2 className="size-3.5 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium truncate">{company.name}</span>
                </div>
                <div className={cn(
                  "flex items-center gap-1.5 text-xs font-semibold shrink-0 bg-background px-2 py-1 rounded-md border border-border",
                  (company.creditsRemaining ?? 0) <= 0 && "text-red-500 border-red-500/20 bg-red-500/10"
                )}>
                  <Coins className="size-3 opacity-70" />
                  <span>{(company.creditsRemaining ?? 0).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grand total */}
        <div className="p-3 border-t border-border/50 bg-muted/30 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total</span>
          <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
            <Coins className="size-4 text-fuchsia-500" />
            <span>{grandTotal.toLocaleString()}</span>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
