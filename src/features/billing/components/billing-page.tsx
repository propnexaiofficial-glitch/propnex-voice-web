"use client";

import { CreditCard } from "lucide-react";
import { motion } from "framer-motion";

import { AddCreditsPanel } from "@/features/billing/components/add-credits-panel";
import { BillingHistoryTable } from "@/features/billing/components/billing-history-table";
import { CreditBalanceCard } from "@/features/billing/components/credit-balance-card";
import { AssignedChannelsPanel } from "@/features/billing/components/assigned-channels-panel";
import { useBilling } from "@/features/billing/hooks/use-billing";

export function BillingPageContent() {
  const {
    summary,
    assignedChannels,
    billingHistory,
    purchaseCredits,
  } = useBilling();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
          <CreditCard className="size-5 text-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Billing & Credits</h2>
          <p className="text-sm text-muted-foreground">
            Manage credits, assigned channels, and payment history
          </p>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <CreditBalanceCard summary={summary} className="lg:col-span-1" />
        <div className="lg:col-span-2">
          <AddCreditsPanel onPurchase={purchaseCredits} />
        </div>
      </div>

      {/* <AssignedChannelsPanel channels={assignedChannels} /> */}

      <BillingHistoryTable items={billingHistory} />
    </div>
  );
}
