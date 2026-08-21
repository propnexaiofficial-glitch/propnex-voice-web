"use client";

import { useState, useEffect, useCallback } from "react";
import { assignedChannels } from "@/features/billing/data";
import type { BillingHistoryItem } from "@/features/billing/types";

export function useBilling() {
  const [history, setHistory] = useState([]);
  const [balance, setBalance] = useState(0);
  const [usedThisMonth, setUsedThisMonth] = useState(0);
  const [hasPendingCreditRequest, setHasPendingCreditRequest] = useState(false);

  const getToken = () =>
    localStorage.getItem("accessToken") || localStorage.getItem("access_token");
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://api.propnexai.com";

  const fetchCreditsAndHistory = useCallback(async () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.creditBalance) {
          setBalance(user.creditBalance.creditsRemaining || 0);
          setUsedThisMonth(user.creditBalance.creditsUsed || 0);
        }
      }

      const token = getToken();
      if (!token) return;

      // Fetch billing history
      const response = await fetch(`${apiBase}/users/billing-history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setHistory(data);
        }
      }

      // Poll pending topup status to auto-lock/unlock the Purchase button
      const pendingRes = await fetch(`${apiBase}/users/pending-topup`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (pendingRes.ok) {
        const pendingData = await pendingRes.json();
        setHasPendingCreditRequest(!!pendingData.hasPending);
      }
    } catch (e) {
      console.error("Billing fetch error:", e);
    }
  }, [apiBase]);

  useEffect(() => {
    fetchCreditsAndHistory();
    const interval = setInterval(fetchCreditsAndHistory, 2000);
    return () => clearInterval(interval);
  }, [fetchCreditsAndHistory]);

  async function purchaseCredits(amount: number): Promise<boolean> {
    try {
      const token = getToken();
      if (!token) return false;

      const response = await fetch(`${apiBase}/users/request-topup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount })
      });

      if (response.ok) {
        // Lock the button immediately — admin must process before next request
        setHasPendingCreditRequest(true);
        return true;
      }

      const errData = await response.json().catch(() => ({}));

      // 409 = already pending (backend guard)
      if (response.status === 409 || errData?.error === "already_pending") {
        setHasPendingCreditRequest(true);
        console.warn("Credit request already pending:", errData?.message);
        return false;
      }

      console.error("Top-up request failed:", errData?.message || response.status);
      return false;
    } catch (err) {
      console.error("Top-up request failed", err);
      return false;
    }
  }

  return {
    summary: { balance, usedThisMonth, monthlyLimit: 10000 },
    assignedChannels,
    billingHistory: history,
    purchaseCredits,
    hasPendingCreditRequest,
  };
}
