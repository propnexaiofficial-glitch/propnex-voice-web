"use client";

import { useEffect, useState, useMemo } from "react";

import type { CallLogFilters } from "@/types/call";
import { type CallRecord } from "@/types/call";
import type { CallListApiResponse } from "@/lib/api-client";
import { fetchInboundCalls } from "@/lib/api-client";

// ─── Hook ─────────────────────────────────────────────────────────────────────

type UseInboundCallsApiState = {
  calls: CallRecord[];
  rawCalls?: any[];
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

function cleanPhone(phone: string): string {
  if (!phone) return "";
  const digitsOnly = phone.replace(/\D/g, "");
  return digitsOnly.replace(/^0+/, "");
}

function mapStatus(raw: string | undefined): CallRecord["status"] {
  const s = (raw ?? "").toLowerCase();
  if (s === "ringing" || s === "dispatching" || s === "queued_at_provider") return "ringing";
  if (s === "answered") return "answered";
  if (s === "completed") return "completed";
  if (s === "failed" || s === "cancelled") return "failed";
  if (s === "missed" || s === "no_answer" || s === "voicemail" || s === "busy") return "missed";
  return "missed";
}

function mapApiItemToCallRecord(item: any, fallbackAssignedNumber: string): CallRecord {
  const pNum = typeof item.phoneNumber === 'string' ? item.phoneNumber : item.phoneNumber?.number;
  const leadPhone = item.lead?.phone;
  const mappedStatus = mapStatus(item.status);
  const isLive = mappedStatus === "ringing" || mappedStatus === "answered";

  let fallbackCustomerPhone = item.providerWebhook?.phone || item.providerWebhook?.message?.call?.customer?.number || item.providerWebhook?.message?.call?.phoneNumber;
  let fallbackAssignedRaw = undefined;
  if (item.providerWebhook?.call) {
    if (item.direction === "INBOUND" || !item.direction) {
      if (!fallbackCustomerPhone) fallbackCustomerPhone = item.providerWebhook.call.from;
      fallbackAssignedRaw = item.providerWebhook.call.to;
    } else if (item.direction === "OUTBOUND") {
      if (!fallbackCustomerPhone) fallbackCustomerPhone = item.providerWebhook.call.to;
      fallbackAssignedRaw = item.providerWebhook.call.from;
    }
  }

  return {
    id: item.id || item.publicId,
    customerNumber: leadPhone || item.customerNumber || fallbackCustomerPhone || "Unknown",
    assignedNumber: pNum || item.assignedNumber || fallbackAssignedRaw || item.providerWebhook?.callid || item.providerWebhook?.calledno || fallbackAssignedNumber,
    callDateTime: item.startedAt || new Date().toISOString(),
    duration: isLive ? "Live" : formatDuration(item.durationSeconds || 0),
    durationSeconds: item.durationSeconds || 0,
    status: mappedStatus,
    creditsUsed: item.creditsUsed || 0,
    recordingUrl: item.recordingUrl || undefined,
    transcriptUrl: item.transcriptUrl || undefined,
    transcript: [],
    liveStartedAt: isLive ? (item.liveStartedAt || item.callDateTime || item.startedAt || new Date().toISOString()) : undefined,
  };
}

const inboundCache: Record<string, any> = {};

export function useInboundCallsApi(
  filters: CallLogFilters,
  page: number,
  retryKey: number = 0,
  hasAssignedNumber: boolean = true,
  companyId?: string,
  direction?: "inbound" | "outbound"
): UseInboundCallsApiState {
  const { search, status, dateFrom, dateTo, assignedNumber, callerNumber, minDuration, durationUnit } = filters;
  const cacheKey = `calls_cache_v5_${direction}_${companyId}_${page}_${JSON.stringify(filters)}`;

  const [state, setState] = useState<{
    rawItems: any[];
    rawTotal: number;
    rawTotalPages: number;
    loading: boolean;
    error: string | null;
  }>(() => {
    if (inboundCache[cacheKey]) {
      return {
        rawItems: inboundCache[cacheKey].rawItems,
        rawTotal: inboundCache[cacheKey].rawTotal,
        rawTotalPages: inboundCache[cacheKey].rawTotalPages,
        loading: false,
        error: null
      };
    }
    return {
      rawItems: [],
      rawTotal: 0,
      rawTotalPages: 1,
      loading: true,
      error: null,
    };
  });

  useEffect(() => {
    let isCancelled = false;

    const load = async (isPolling = false) => {
      if (!isPolling) {
        if (!inboundCache[cacheKey]) {
          setState((prev) => ({ ...prev, rawItems: [], loading: true, error: null }));
        }
      }

      try {
        const res: CallListApiResponse = await fetchInboundCalls({
          status: status !== "all" ? status : undefined,
          page,
          limit: PAGE_SIZE,
          companyId,
          direction: direction === "inbound" ? "INBOUND" : direction === "outbound" ? "OUTBOUND" : undefined,
          search,
          assignedNumber,
          callerNumber,
          dateFrom,
          dateTo,
          minDuration,
          durationUnit,
        });

        if (isCancelled) return;

        setState({
          rawItems: res.data || [],
          rawTotal: res.meta?.total || 0,
          rawTotalPages: res.meta?.totalPages || 1,
          loading: false,
          error: null,
        });

        inboundCache[cacheKey] = {
          rawItems: res.data || [],
          rawTotal: res.meta?.total || 0,
          rawTotalPages: res.meta?.totalPages || 1,
        };
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
    }, 15000); // 15 seconds

    return () => {
      isCancelled = true;
      clearInterval(intervalId);
    };
  }, [status, page, retryKey, hasAssignedNumber, companyId, direction, search, assignedNumber, callerNumber, dateFrom, dateTo, minDuration, durationUnit]);

  const fallbackAssignedNumber = "Unknown"; // Can fetch from localStorage if needed, omitted here to keep synchronous filtering fast.

  const processedState = useMemo(() => {
    let items = state.rawItems;

    return {
      calls: items.map((item: any) => mapApiItemToCallRecord(item, fallbackAssignedNumber)),
      rawCalls: items,
      total: state.rawTotal,
      totalPages: state.rawTotalPages,
      loading: state.loading,
      error: state.error,
    };
  }, [state, search, dateFrom, dateTo, assignedNumber, callerNumber, minDuration, durationUnit]);

  return processedState;
}

export { PAGE_SIZE as INBOUND_API_PAGE_SIZE };
