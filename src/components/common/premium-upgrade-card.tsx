"use client";

import { ArrowRight, Crown, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("premium-upgrade-card relative overflow-hidden rounded-xl p-4", className)}
    >
      {/* Animated gold shimmer background */}
      <div className="premium-upgrade-shimmer pointer-events-none absolute inset-0" aria-hidden />
      <div className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-gold/20 blur-2xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-4 -left-4 size-16 rounded-full bg-primary/20 blur-xl" aria-hidden />

      <div className="relative space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg gradient-gold glow-gold">
              <Crown className="size-4 text-navy" />
            </div>
            {!compact && (
              <div>
                <p className="text-sm font-bold text-foreground">Upgrade to Pro</p>
                <p className="text-[10px] text-gold">Unlock full potential</p>
              </div>
            )}
          </div>
          <PremiumBadge label="Pro" size="sm" />
        </div>

        {!compact && (
          <p className="text-xs leading-relaxed text-muted-foreground">
            Unlimited voice agents, priority support, advanced analytics &{" "}
            <span className="font-medium text-gold-light">Premium</span> features.
          </p>
        )}

        <Button
          variant="gold"
          size="sm"
          className="group w-full gap-2 font-semibold"
        >
          <Sparkles className="size-3.5" />
          Upgrade Now
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </div>
    </motion.div>
  );
}
