"use client";

import { useState } from "react";

import {
  billingHistory,
  billingSummary,
  creditPackages,
  telephonyChannels,
} from "@/features/billing/data";
import type { CreditPackage } from "@/features/billing/types";

export function useBilling() {
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    creditPackages.find((p) => p.popular)?.id ?? null
  );
  const [history] = useState(billingSummary);

  const selectedPackage: CreditPackage | undefined = creditPackages.find(
    (p) => p.id === selectedPackageId
  );

  function selectPackage(id: string) {
    setSelectedPackageId(id);
  }

  function purchaseCredits() {
    // UI-only — no backend
    if (!selectedPackage) return;
  }

  return {
    summary: history,
    creditPackages,
    telephonyChannels,
    billingHistory,
    selectedPackageId,
    selectedPackage,
    selectPackage,
    purchaseCredits,
  };
}
