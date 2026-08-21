"use client";

import { useState } from "react";
import { Coins, Loader2, ArrowRight, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { SubCompany } from "@/features/employees/types";
import { useEmployeesContext } from "@/features/employees/context/employees-context";
import { cn } from "@/lib/utils";

type TransferCreditsModalProps = {
  company: SubCompany;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type TransferAction = "ADD" | "REDUCE";

export function TransferCreditsModal({
  company,
  open,
  onOpenChange,
}: TransferCreditsModalProps) {
  const [action, setAction] = useState<TransferAction>("ADD");
  const [amount, setAmount] = useState<number | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { refreshCompanies } = useEmployeesContext();

  const handleSubmit = async () => {
    if (!amount || amount <= 0) {
      setError("Please enter a valid amount to transfer.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const token = localStorage.getItem("accessToken") || localStorage.getItem("access_token");
      const apiBase = "/api";
      const res = await fetch(`${apiBase}/sub-companies/${company.id}/transfer-credits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: Number(amount), action }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to transfer credits");
      }

      await refreshCompanies();
      
      // Update local storage user balance instantly for the dashboard shell
      try {
        const refreshRes = await fetch(`${apiBase}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store"
        });
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
            window.dispatchEvent(new Event("user-updated"));
          }
        }
      } catch(e) {}

      setAmount("");
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Failed to transfer credits");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = (next: boolean) => {
    if (!next) {
      setAmount("");
      setError("");
      setAction("ADD");
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="size-5 text-foreground" />
            Manage Credits
          </DialogTitle>
          <DialogDescription>
            {action === "ADD" 
              ? `Allocate credits from your main balance to ${company.name}.`
              : `Withdraw credits from ${company.name} back to your main balance.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex w-full items-center gap-2 rounded-lg border border-border p-1 bg-muted/50">
            <button
              type="button"
              onClick={() => setAction("ADD")}
              className={cn(
                "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                action === "ADD" ? "bg-background text-foreground shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Add Credits
            </button>
            <button
              type="button"
              onClick={() => setAction("REDUCE")}
              className={cn(
                "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                action === "REDUCE" ? "bg-background text-foreground shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Withdraw Credits
            </button>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="amount" className="text-xs font-medium text-muted-foreground">
              Amount to {action === "ADD" ? "Transfer" : "Withdraw"}
            </label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                min="1"
                placeholder="e.g. 500"
                value={amount}
                disabled={submitting}
                onChange={(e) => setAmount(e.target.value === "" ? "" : parseInt(e.target.value))}
                className="pl-8"
              />
              <Coins className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            <p className="text-[10px] text-muted-foreground">
              {action === "ADD"
                ? "These credits will be deducted from your available balance immediately."
                : "These credits will be added back to your available balance immediately."}
            </p>
          </div>

          {error && (
            <p className="text-center text-xs text-red-500">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            disabled={!amount || amount <= 0 || submitting}
            onClick={handleSubmit}
            className="gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Confirm {action === "ADD" ? "Transfer" : "Withdraw"}
                {action === "ADD" ? <ArrowRight className="size-4" /> : <ArrowLeft className="size-4" />}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
