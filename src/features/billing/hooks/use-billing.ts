"use client";

import { useState } from "react";

import {
  assignedChannels,
  billingHistory,
  billingSummary,
} from "@/features/billing/data";

export function useBilling() {
  const [history] = useState(billingSummary);

  function purchaseCredits() {
    // UI-only — no backend
  }

  return {
    summary: history,
    assignedChannels,
    billingHistory,
    purchaseCredits,
  };
}
