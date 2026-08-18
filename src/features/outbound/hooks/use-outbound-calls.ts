"use client";

import { useState } from "react";
import type { CallLogFilters } from "@/types/call";

const OUTBOUND_PAGE_SIZE = 8;

export function useOutboundCalls() {
  const [filters, setFilters] = useState<CallLogFilters>({
    search: "",
    status: "all",
    dateFrom: "",
    dateTo: "",
    durationSort: "default",
  });
  
  const [page, setPage] = useState(1);

  return {
    filters,
    updateFilters: (next: CallLogFilters) => { setFilters(next); setPage(1); },
    resetFilters: () => { setFilters({ search: "", status: "all", dateFrom: "", dateTo: "", durationSort: "default" }); setPage(1); },
    calls: [],
    totalCalls: 0,
    page,
    totalPages: 1,
    pageSize: OUTBOUND_PAGE_SIZE,
    setPage,
    loading: false,
    error: null,
    handleRetry: () => {}
  };
}
