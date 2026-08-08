"use client";

import { useEffect, useState } from "react";

import {
  fetchInboundCalls,
  type CallListApiResponse,
  type InboundCallApiItem,
} from "@/lib/api-client";
import type { CallLogFilters } from "@/types/call";
import { type CallRecord, type CallStatus } from "@/types/call";

// ─── API → CallRecord mapper ──────────────────────────────────────────────────

const STATUS_MAP: Record<string, CallStatus> = {
  COMPLETED: "completed",
  ANSWERED: "completed",
  MISSED: "missed",
  VOICEMAIL: "missed",
  NO_ANSWER: "missed",
  FAILED: "failed",
  BUSY: "failed",
  CANCELLED: "failed",
  PENDING: "failed",
  QUEUED: "failed",
  DISPATCHING: "failed",
  QUEUED_AT_PROVIDER: "failed",
  RINGING: "failed",
};

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "0m 0s";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function mapApiItemToCallRecord(item: InboundCallApiItem): CallRecord {
  return {
    id: item.id,
    callId: item.publicId,
    callerId: item.providerCallId ?? undefined,
    customerNumber: item.providerCallId ?? "Unknown",
    assignedNumber: item.phoneNumberId ?? item.companyId ?? "N/A",
    callDateTime: item.startedAt,
    duration: formatDuration(item.durationSeconds),
    durationSeconds: item.durationSeconds,
    status: STATUS_MAP[item.status?.toUpperCase()] ?? "failed",
    creditsUsed: Math.max(1, Math.round(item.durationSeconds / 12)),
    recordingUrl: item.recordingUrl ?? undefined,
    transcript: [],
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

type UseInboundCallsApiState = {
  calls: CallRecord[];
  total: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
};

const PAGE_SIZE = 8;

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
        });

        if (isCancelled) return;

        // Client-side search filter (server doesn't support free-text search yet)
        let items = res.data;
        if (search.trim()) {
          const q = search.toLowerCase();
          items = items.filter(
            (item) =>
              item.publicId.toLowerCase().includes(q) ||
              (item.providerCallId ?? "").toLowerCase().includes(q) ||
              (item.phoneNumberId ?? "").toLowerCase().includes(q)
          );
        }

        // Client-side date range filter
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
