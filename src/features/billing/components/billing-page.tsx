"use client";

import { CreditCard } from "lucide-react";
import { motion } from "framer-motion";

import { AddCreditsPanel } from "@/features/billing/components/add-credits-panel";
import { BillingHistoryTable } from "@/features/billing/components/billing-history-table";
import { CreditBalanceCard } from "@/features/billing/components/credit-balance-card";
import { TelephonyChannelsPanel } from "@/features/billing/components/telephony-channels-panel";
import { useBilling } from "@/features/billing/hooks/use-billing";

export function BillingPageContent() {
  const {
    summary,
    creditPackages,
    telephonyChannels,
    billingHistory,
    selectedPackageId,
    selectPackage,
    purchaseCredits,
  } = useBilling();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15">
          <CreditCard className="size-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Billing & Credits</h2>
          <p className="text-sm text-muted-foreground">
            Manage credits, telephony channels, and payment history
          </p>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <CreditBalanceCard summary={summary} className="lg:col-span-1" />
        <div className="lg:col-span-2">
          <AddCreditsPanel
            packages={creditPackages}
            selectedPackageId={selectedPackageId}
            onSelect={selectPackage}
            onPurchase={purchaseCredits}
          />
        </div>
      </div>

      <TelephonyChannelsPanel channels={telephonyChannels} />

      <BillingHistoryTable items={billingHistory} />
    </div>
  );
}
