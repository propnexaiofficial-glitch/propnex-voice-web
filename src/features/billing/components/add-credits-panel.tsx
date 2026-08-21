"use client";

import { CreditCard, CheckCircle2, Loader2, Clock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AddCreditsPanelProps = {
  onPurchase: (amount: number) => Promise<boolean>;
  currentBalance: number;
  /** True while a credit request is pending admin approval */
  isPending?: boolean;
};

export function AddCreditsPanel({ onPurchase, currentBalance, isPending = false }: AddCreditsPanelProps) {
  const [amount, setAmount] = useState<number>(5000);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    setError(null);
    setSuccess(false);

    if (isPending) {
      setError("You already have a pending credit request. Please wait for the admin to process it.");
      return;
    }

    if (amount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    if (currentBalance + amount > 10000) {
      setError(`Cannot exceed 10,000 maximum limit. You can request up to ${10000 - currentBalance} more credits.`);
      return;
    }

    setLoading(true);
    const result = await onPurchase(amount);
    setLoading(false);

    if (result) {
      setSuccess(true);
      setAmount(0);
    } else {
      // If the hook returned false due to a 409, isPending will be true on next render.
      // Show a generic message; the isPending banner will handle the rest.
      setError("Could not submit request. You may already have a pending request.");
    }
  };

  return (
    <div className="glass-card flex h-full flex-col justify-center rounded-2xl p-6">
      <div className="mb-6 flex items-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
          <CreditCard className="size-4 text-foreground" />
        </div>
        <h3 className="text-sm font-semibold">Add Credits</h3>
      </div>

      {/* Pending request banner */}
      {isPending && (
        <div className="mb-4 flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-amber-500">
          <Clock className="mt-0.5 size-4 shrink-0" />
          <p className="text-sm font-medium">
            A credit request is pending admin approval. The button will unlock automatically once it is processed.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Input
              type="number"
              value={amount || ""}
              onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
              className="pl-4 h-12"
              placeholder="Amount to request..."
              disabled={isPending || loading}
            />
          </div>
          <Button
            size="lg"
            onClick={handlePurchase}
            disabled={loading || isPending}
            className="h-12 gap-2 text-base font-semibold whitespace-nowrap px-8"
          >
            {loading ? <Loader2 className="size-5 animate-spin" /> : <CreditCard className="size-5" />}
            {loading ? "Requesting..." : isPending ? "Pending Approval" : "Purchase Credits"}
          </Button>
        </div>

        {error && <p className="text-sm text-red-500 font-medium px-1">{error}</p>}
        {success && (
          <div className="flex items-start gap-2 rounded-lg bg-emerald-500/10 p-3 text-emerald-500">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            <p className="text-sm font-medium">Request sent successfully. Please wait until the credit is added by the admin.</p>
          </div>
        )}
      </div>
    </div>
  );
}
