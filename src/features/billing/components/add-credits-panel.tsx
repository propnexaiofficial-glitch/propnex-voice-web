"use client";

import { Check, CreditCard, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

import { PremiumBadge } from "@/components/common/premium-badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CreditPackage } from "@/features/billing/types";

type AddCreditsPanelProps = {
  packages: CreditPackage[];
  selectedPackageId: string | null;
  onSelect: (id: string) => void;
  onPurchase: () => void;
};

export function AddCreditsPanel({
  packages,
  selectedPackageId,
  onSelect,
  onPurchase,
}: AddCreditsPanelProps) {
  const selected = packages.find((p) => p.id === selectedPackageId);

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="mb-5 flex items-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15">
          <CreditCard className="size-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">Add Credits</h3>
          <p className="text-xs text-muted-foreground">
            Select a package and top up your balance
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {packages.map((pkg, index) => {
          const isSelected = selectedPackageId === pkg.id;
          const pricePerCredit = (pkg.price / pkg.credits).toFixed(3);

          return (
            <motion.button
              key={pkg.id}
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelect(pkg.id)}
              className={cn(
                "relative rounded-xl border p-4 text-left transition-all",
                isSelected
                  ? "border-primary/60 bg-primary/10 ring-1 ring-primary/40"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8",
                pkg.premium && !isSelected && "border-gold/20"
              )}
            >
              {pkg.popular && (
                <span className="absolute -top-2.5 right-3 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  Popular
                </span>
              )}
              {pkg.premium && (
                <div className="absolute -top-2.5 left-3">
                  <PremiumBadge size="sm" label="Premium" />
                </div>
              )}

              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-lg font-bold">
                    {pkg.credits.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">credits</p>
                </div>
                {isSelected && (
                  <div className="flex size-5 items-center justify-center rounded-full bg-primary">
                    <Check className="size-3 text-white" />
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <p className="text-sm font-semibold">
                  {pkg.currency} {pkg.price}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {pkg.currency} {pricePerCredit}/credit
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          {selected ? (
            <span>
              Selected:{" "}
              <span className="font-medium text-foreground">
                {selected.credits.toLocaleString()} credits — {selected.currency}{" "}
                {selected.price}
              </span>
            </span>
          ) : (
            "Select a package to continue"
          )}
        </div>
        <Button
          variant={selected?.premium ? "gold" : "default"}
          disabled={!selected}
          onClick={onPurchase}
          className="shrink-0"
        >
          {selected?.premium ? (
            <Sparkles className="size-4" />
          ) : (
            <CreditCard className="size-4" />
          )}
          Purchase Credits
        </Button>
      </div>
    </div>
  );
}
