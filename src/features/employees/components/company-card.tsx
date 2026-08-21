"use client";



import Link from "next/link";

import { Building2, Lock } from "lucide-react";
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

  const isLocked = !company.contactPhone;
  const isPending = company.status.toUpperCase() === "PENDING" || isLocked;

  const innerContent = (
    <>
      <div className="flex items-center gap-3">
        <div className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",
          isPending ? "bg-amber-500/10 text-amber-500" : "bg-muted text-foreground group-hover:bg-accent"
        )}>
          {isPending ? <Lock className="size-4" /> : <Building2 className="size-4" />}
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
          variant={isLocked ? "secondary" : company.status === "active" ? "success" : "secondary"}
          className={cn("shrink-0 text-[10px]", isLocked && "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20")}
        >
          {isLocked ? "LOCKED" : company.status}
        </Badge>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">Credits Allocated: {company.creditsLimit.toLocaleString()}</span>
            <span className="font-medium tabular-nums">
              {usagePercent}% Used
            </span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-foreground transition-all"
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
        </div>
        
        {isLocked ? (
          <div className="flex items-center justify-center rounded-lg border border-dashed border-amber-500/30 bg-amber-500/5 py-2 text-[10px] text-amber-500">
            <Lock className="mr-1.5 size-3" />
            Waiting for phone assignment
          </div>
        ) : (
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex flex-col">
              <span className="text-muted-foreground">Inbound Calls</span>
              <span className="font-semibold text-foreground">{company.inboundCalls.toLocaleString()}</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-muted-foreground">Outbound Calls</span>
              <span className="font-semibold text-foreground">{company.outboundCalls.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>
    </>
  );

  const cardClasses = cn(
    "group flex h-full flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3.5 transition-all",
    isLocked ? "cursor-not-allowed" : "hover:border-foreground/20 hover:bg-accent/50",
    isPending && "border-amber-500/30 bg-amber-500/5"
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={className}
    >
      {isLocked ? (
        <div className={cardClasses}>
          {innerContent}
        </div>
      ) : (
        <Link href={`/dashboard/employees/${company.id}/overview`} className={cardClasses}>
          {innerContent}
        </Link>
      )}
    </motion.div>

  );

}

