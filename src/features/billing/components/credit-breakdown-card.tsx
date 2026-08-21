"use client";

import { Building2, Coins, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { useEmployeesContext } from "@/features/employees/context/employees-context";
import { PremiumBadge } from "@/components/common/premium-badge";

type CreditBreakdownCardProps = {
  className?: string;
};

export function CreditBreakdownCard({ className }: CreditBreakdownCardProps) {
  const { companies, loading } = useEmployeesContext();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={cn("glass-card overflow-hidden rounded-lg", className)}
    >
      <div className="border-b border-border p-6">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
            <Building2 className="size-4 text-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold">Sub-Company Allocations</p>
            <p className="text-xs text-muted-foreground">Credits allocated to child tenants</p>
          </div>
        </div>
      </div>

      <div className="p-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
            <p className="mt-2 text-xs text-muted-foreground">Loading allocations...</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">No sub-companies found.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {companies.map((company, i) => {
              const usagePercent = Math.round(
                (company.creditsUsed / company.creditsLimit) * 100
              );

              return (
                <div key={company.id} className="flex items-center justify-between p-4 px-6 hover:bg-accent/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                      <Building2 className="size-3.5 text-foreground" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium">{company.name}</p>
                        {company.isPremium && <PremiumBadge size="sm" />}
                      </div>
                      <p className="text-xs text-muted-foreground capitalize">
                        {company.status}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-right">
                    <div className="hidden sm:block">
                      <p className="text-xs text-muted-foreground mb-1">Usage</p>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-foreground transition-all"
                            style={{ width: `${Math.min(usagePercent, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{usagePercent}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold flex items-center justify-end gap-1.5">
                        {company.creditsRemaining.toLocaleString()}
                        <Coins className="size-3.5 text-muted-foreground" />
                      </p>
                      <p className="text-xs text-muted-foreground">remaining</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
