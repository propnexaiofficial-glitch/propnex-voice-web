"use client";

import { useEffect, useState } from "react";

import type { CallLogFilters } from "@/types/call";
import { type CallRecord } from "@/types/call";
import type { CallListApiResponse } from "@/lib/api-client";
import { fetchInboundCalls } from "@/lib/api-client";

// ─── Hook ─────────────────────────────────────────────────────────────────────

type UseInboundCallsApiState = {
  calls: CallRecord[];
  total: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
};

const PAGE_SIZE = 8;

function formatDuration(seconds: number): string {
  if (!seconds) return "0s";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function mapApiItemToCallRecord(item: any, fallbackAssignedNumber: string): CallRecord {
  return {
    id: item.id || item.publicId,
    customerNumber: item.customerNumber || item.phoneNumber || item.providerWebhook?.phone || item.providerWebhook?.message?.call?.customer?.number || item.providerWebhook?.message?.call?.phoneNumber || "Unknown",
    assignedNumber: item.providerWebhook?.callid || item.providerWebhook?.calledno || fallbackAssignedNumber,
    callDateTime: item.startedAt || new Date().toISOString(),
    duration: formatDuration(item.durationSeconds || 0),
    durationSeconds: item.durationSeconds || 0,
    status: item.status?.toLowerCase() === "completed" ? "completed" : 
            item.status?.toLowerCase() === "failed" ? "failed" : "missed",
    creditsUsed: item.creditsUsed || 0,
    recordingUrl: item.recordingUrl || undefined,
    transcriptUrl: item.transcriptUrl || undefined,
    transcript: [],
  };
}

export function useInboundCallsApi(
  filters: CallLogFilters,
  page: number,
  retryKey: number = 0,
  hasAssignedNumber: boolean = true,
  companyId?: string,
  direction?: "inbound" | "outbound"
): UseInboundCallsApiState {
  const [state, setState] = useState<UseInboundCallsApiState>({
    calls: [],
    total: 0,
    totalPages: 1,
    loading: true,
    error: null,
  });

  const { search, status, dateFrom, dateTo, assignedNumber, callerNumber, minDuration } = filters;

  useEffect(() => {
    let isCancelled = false;

    const load = async (isPolling = false) => {
      if (!isPolling) {
        setState((prev) => ({ ...prev, loading: true, error: null }));
      }

      try {
        const res: CallListApiResponse = await fetchInboundCalls({
          status: status !== "all" ? status : undefined,
          page,
          limit: PAGE_SIZE,
          companyId,
          direction: direction === "inbound" ? "INBOUND" : direction === "outbound" ? "OUTBOUND" : undefined,
        });

        if (isCancelled) return;

        let items = res.data as any[];

        let fallbackAssignedNumber = "Unknown";
        try {
          const userStr = localStorage.getItem("user");
          if (userStr) {
            const user = JSON.parse(userStr);
            fallbackAssignedNumber = user.assignedNumber || "Unknown";
          }
        } catch (e) {}

        // Client-side search filters
        if (search && search.trim()) {
          const q = search.toLowerCase();
          items = items.filter((item) => {
            const customerNum = (item.customerNumber || item.phoneNumber || item.providerWebhook?.phone || item.providerWebhook?.message?.call?.customer?.number || item.providerWebhook?.message?.call?.phoneNumber || "Unknown").toLowerCase();
            return (
              item.publicId?.toLowerCase().includes(q) ||
              (item.providerCallId ?? "").toLowerCase().includes(q) ||
              (item.phoneNumberId ?? "").toLowerCase().includes(q) ||
              customerNum.includes(q)
            );
          });
        }

        if (assignedNumber && assignedNumber.trim()) {
          const q = assignedNumber.toLowerCase();
          items = items.filter((item) => {
             const num = (item.assignedNumber && item.assignedNumber !== "Unknown" ? item.assignedNumber : fallbackAssignedNumber).toLowerCase();
             return num.includes(q);
          });
        }

        if (callerNumber && callerNumber.trim()) {
          const q = callerNumber.toLowerCase();
          items = items.filter((item) => {
             const num = (item.customerNumber || item.phoneNumber || item.providerWebhook?.phone || item.providerWebhook?.message?.call?.customer?.number || item.providerWebhook?.message?.call?.phoneNumber || "Unknown").toLowerCase();
             return num.includes(q);
          });
        }

        if (dateFrom || dateTo) {
          items = items.filter((item) => {
            const d = item.startedAt.slice(0, 10);
            if (dateFrom && d < dateFrom) return false;
            if (dateTo && d > dateTo) return false;
            return true;
          });
        }

        if (minDuration && minDuration.trim()) {
          const minSec = parseFloat(minDuration);
          if (!isNaN(minSec)) {
             items = items.filter((item) => (item.durationSeconds || 0) >= minSec);
          }
        }

        const isFilteredLocally = Boolean(
          (search && search.trim()) || 
          dateFrom || dateTo || 
          (assignedNumber && assignedNumber.trim()) || 
          (callerNumber && callerNumber.trim()) || 
          (minDuration && minDuration.trim())
        );
        const finalTotal = isFilteredLocally ? items.length : (res.meta?.total || items.length);
        const finalTotalPages = isFilteredLocally 
          ? (Math.ceil(items.length / PAGE_SIZE) || 1) 
          : (res.meta?.totalPages || Math.ceil(finalTotal / PAGE_SIZE) || 1);

        setState({
          calls: items.map((item: any) => mapApiItemToCallRecord(item, fallbackAssignedNumber)),
          total: finalTotal,
          totalPages: finalTotalPages,
          loading: false,
          error: null,
        });
      } catch (err) {
        if (isCancelled) return;
        const message =
          err instanceof Error ? err.message : "Failed to load inbound calls";
        setState((prev) => ({
          ...prev,
          loading: false,
          error: message,
        }));
      }
    };

    void load();

    const intervalId = setInterval(() => {
      void load(true);
    }, 5000);

    return () => {
      isCancelled = true;
      clearInterval(intervalId);
    };
  }, [search, status, dateFrom, dateTo, assignedNumber, callerNumber, minDuration, page, retryKey, hasAssignedNumber, companyId, direction]);

  return state;
}

export { PAGE_SIZE as INBOUND_API_PAGE_SIZE };
