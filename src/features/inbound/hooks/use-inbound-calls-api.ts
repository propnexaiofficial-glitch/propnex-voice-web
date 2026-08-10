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

function mapApiItemToCallRecord(item: any): CallRecord {
  return {
    id: item.id || item.publicId,
    customerNumber: item.customerNumber || item.phoneNumber || "Unknown",
    assignedNumber: item.assignedNumber || "Unknown",
    callDateTime: item.startedAt || new Date().toISOString(),
    duration: formatDuration(item.durationSeconds || 0),
    durationSeconds: item.durationSeconds || 0,
    status: item.status?.toLowerCase() === "completed" ? "completed" : 
            item.status?.toLowerCase() === "failed" ? "failed" : "missed",
    creditsUsed: item.creditsUsed || 0,
    transcript: [],
  };
}

export function useInboundCallsApi(
  filters: CallLogFilters,
  page: number,
  retryKey: number = 0
): UseInboundCallsApiState {
  const [state, setState] = useState<UseInboundCallsApiState>({
    calls: [],
    total: 0,
    totalPages: 1,
    loading: true,
    error: null,
  });

  const { search, status, dateFrom, dateTo } = filters;

  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const res: CallListApiResponse = await fetchInboundCalls({
          status: status !== "all" ? status : undefined,
          page,
          limit: PAGE_SIZE,
          search: search.trim() || undefined,
        });

        if (isCancelled) return;

        let items = res.data;

        if (dateFrom || dateTo) {
          items = items.filter((item) => {
            const d = item.startedAt.slice(0, 10);
            if (dateFrom && d < dateFrom) return false;
            if (dateTo && d > dateTo) return false;
            return true;
          });
        }

        setState({
          calls: items.map(mapApiItemToCallRecord),
          total: res.meta.total,
          totalPages: res.meta.totalPages,
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

    return () => {
      isCancelled = true;
    };
  }, [search, status, dateFrom, dateTo, page, retryKey]);

  return state;
}

export { PAGE_SIZE as INBOUND_API_PAGE_SIZE };
