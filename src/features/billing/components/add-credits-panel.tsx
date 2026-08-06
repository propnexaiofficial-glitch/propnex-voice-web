"use client";

import { CreditCard } from "lucide-react";

import { Button } from "@/components/ui/button";

type AddCreditsPanelProps = {
  onPurchase: () => void;
};

export function AddCreditsPanel({ onPurchase }: AddCreditsPanelProps) {
  return (
    <div className="glass-card flex h-full flex-col justify-center rounded-2xl p-6">
      <div className="mb-6 flex items-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15">
          <CreditCard className="size-4 text-primary" />
        </div>
        <h3 className="text-sm font-semibold">Add Credits</h3>
      </div>

      <Button
        size="lg"
        onClick={onPurchase}
        className="h-12 w-full gap-2 text-base font-semibold shadow-[var(--glow-purple)]"
      >
        <CreditCard className="size-5" />
        Purchase Credits
      </Button>
    </div>
  );
}
