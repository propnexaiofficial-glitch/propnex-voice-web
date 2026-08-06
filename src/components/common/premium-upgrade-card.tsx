"use client";

import { ArrowRight, Crown } from "lucide-react";

import { PremiumBadge } from "@/components/common/premium-badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PremiumUpgradeCardProps = {
  className?: string;
  compact?: boolean;
};

export function PremiumUpgradeCard({
  className,
  compact = false,
}: PremiumUpgradeCardProps) {
  return (
    <div className={cn("premium-upgrade-card relative overflow-hidden rounded-xl p-4", className)}>
      <div className="premium-upgrade-shimmer pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
              <Crown className="size-4 text-foreground" />
            </div>
            {!compact && (
              <div>
                <p className="text-sm font-semibold text-foreground">Upgrade to Pro</p>
                <p className="text-[10px] text-muted-foreground">Unlock full potential</p>
              </div>
            )}
          </div>
          <PremiumBadge label="Pro" size="sm" />
        </div>

        {!compact && (
          <p className="text-xs leading-relaxed text-muted-foreground">
            Unlimited voice agents, priority support, and advanced analytics.
          </p>
        )}

        <Button variant="default" size="sm" className="group w-full gap-2">
          Upgrade Now
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </div>
    </div>
  );
}
