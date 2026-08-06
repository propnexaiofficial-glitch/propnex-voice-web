"use client";

import Link from "next/link";
import { Building2 } from "lucide-react";
import { motion } from "framer-motion";

import { PremiumBadge } from "@/components/common/premium-badge";
import { Badge } from "@/components/ui/badge";
import type { SubCompany } from "@/features/employees/types";
import { cn } from "@/lib/utils";

type CompanyCardProps = {
  company: SubCompany;
  index?: number;
  className?: string;
};

export function CompanyCard({ company, index = 0, className }: CompanyCardProps) {
  const usagePercent = Math.round(
    (company.creditsUsed / company.creditsLimit) * 100
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={className}
    >
      <Link
        href={`/dashboard/employees/${company.id}/overview`}
        className={cn(
          "group flex h-full flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3.5 transition-all hover:border-foreground/20 hover:bg-accent/50"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted transition-colors group-hover:bg-accent">
            <Building2 className="size-4 text-foreground" />
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
          <div className="h-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-foreground transition-all"
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
