"use client";

import { useMemo, useState } from "react";

import { inboundCalls, INBOUND_PAGE_SIZE } from "@/features/inbound/data";
import { DEFAULT_CALL_FILTERS, type CallLogFilters, type CallRecord } from "@/types/call";

function matchesSearch(call: CallRecord, search: string) {
  if (!search.trim()) return true;
  const query = search.toLowerCase();
  const callId = call.callId ?? call.id;
  const callerId = call.callerId ?? call.customerNumber;
  return (
    callId.toLowerCase().includes(query) ||
    callerId.toLowerCase().includes(query) ||
    call.customerNumber.toLowerCase().includes(query) ||
    call.assignedNumber.toLowerCase().includes(query)
  );
}

function matchesStatus(call: CallRecord, status: CallLogFilters["status"]) {
  if (status === "all") return true;
  return call.status === status;
}

function matchesDateRange(
  call: CallRecord,
  dateFrom: string,
  dateTo: string
) {
  const callDate = call.callDateTime.slice(0, 10);
  if (dateFrom && callDate < dateFrom) return false;
  if (dateTo && callDate > dateTo) return false;
  return true;
}

export function useInboundCalls() {
  const [filters, setFilters] = useState<CallLogFilters>(DEFAULT_CALL_FILTERS);
  const [page, setPage] = useState(1);

  const filteredCalls = useMemo(() => {
    return []; // Return empty array to disable mock data
  }, [filters]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCalls.length / INBOUND_PAGE_SIZE)
  );
  const currentPage = Math.min(page, totalPages);

  const paginatedCalls = useMemo(() => {
    const start = (currentPage - 1) * INBOUND_PAGE_SIZE;
    return filteredCalls.slice(start, start + INBOUND_PAGE_SIZE);
  }, [filteredCalls, currentPage]);

  const updateFilters = (next: CallLogFilters) => {
    setFilters(next);
    setPage(1);
  };

  const resetFilters = () => {
    setFilters(DEFAULT_CALL_FILTERS);
    setPage(1);
  };

  const setCurrentPage = (nextPage: number) => {
    setPage(Math.max(1, Math.min(nextPage, totalPages)));
  };

  return {
    filters,
    updateFilters,
    resetFilters,
    calls: paginatedCalls,
    totalCalls: filteredCalls.length,
    page: currentPage,
    totalPages,
    pageSize: INBOUND_PAGE_SIZE,
    setPage: setCurrentPage,
  };
}
