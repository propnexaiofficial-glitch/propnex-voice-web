"use client";

import { useState, useEffect } from "react";
import { assignedChannels } from "@/features/billing/data";
import type { BillingHistoryItem } from "@/features/billing/types";

export function useBilling() {
  const [history, setHistory] = useState([]);
  const [balance, setBalance] = useState(0);
  const [usedThisMonth, setUsedThisMonth] = useState(0);

  const fetchCreditsAndHistory = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.creditBalance) {
          setBalance(user.creditBalance.creditsRemaining || 0);
          setUsedThisMonth(user.creditBalance.creditsUsed || 0);
        }
      }

      const token = localStorage.getItem("accessToken") || localStorage.getItem("access_token");
      if (!token) return;

      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiBase}/users/billing-history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchCreditsAndHistory();
    const interval = setInterval(fetchCreditsAndHistory, 5000);
    return () => clearInterval(interval);
  }, []);

  async function purchaseCredits(amount: number): Promise<boolean> {
    try {
      const token = localStorage.getItem("accessToken") || localStorage.getItem("access_token");
      if (!token) return false;
      
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiBase}/users/request-topup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount })
      });

      if (response.ok) {
        return true;
      }
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
  };
}
