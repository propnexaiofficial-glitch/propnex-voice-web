"use client";

import { Building2 } from "lucide-react";
import { motion } from "framer-motion";

import { PremiumBadge } from "@/components/common/premium-badge";
import { Badge } from "@/components/ui/badge";
import type { SubCompany } from "@/features/employees/types";
import { cn } from "@/lib/utils";

type CompanyCardProps = {
  company: SubCompany;
  isSelected: boolean;
  onSelect: (id: string) => void;
  index?: number;
};

export function CompanyCard({
  company,
  isSelected,
  onSelect,
  index = 0,
}: CompanyCardProps) {
  const usagePercent = Math.round(
    (company.creditsUsed / company.creditsLimit) * 100
  );

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => onSelect(company.id)}
      className={cn(
        "flex w-full flex-col gap-3 rounded-xl border px-4 py-3.5 text-left transition-all",
        isSelected
          ? "border-primary/50 bg-primary/10 shadow-[var(--glow-purple)]"
          : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            company.isPremium ? "gradient-gold" : "bg-primary/15"
          )}
        >
          <Building2
            className={cn(
              "size-4",
              company.isPremium ? "text-navy" : "text-primary"
            )}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold">{company.name}</p>
            {company.isPremium && <PremiumBadge size="sm" />}
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Joined{" "}
            {new Date(company.joinedDate).toLocaleDateString("en-SG", {
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>

        <Badge
          variant={company.status === "active" ? "success" : "secondary"}
          className="shrink-0 text-[10px]"
        >
          {company.status}
        </Badge>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground">Credits</span>
          <span className="font-medium tabular-nums">
            {usagePercent}% · {company.creditsUsed.toLocaleString()}
          </span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-white/10">
          <div
            className={cn(
              "h-full rounded-full",
              company.isPremium ? "gradient-gold" : "gradient-primary"
            )}
            style={{ width: `${Math.min(usagePercent, 100)}%` }}
          />
        </div>
      </div>
    </motion.button>
  );
}
