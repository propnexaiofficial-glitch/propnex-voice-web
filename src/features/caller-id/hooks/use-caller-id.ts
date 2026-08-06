"use client";

import { useCallback, useMemo, useState } from "react";

import { callerIdRecords } from "@/features/caller-id/data";
import {
  DEFAULT_CALLER_ID_FILTERS,
  type AddCallerIdForm,
  type CallerIdFilters,
  type CallerIdRecord,
} from "@/features/caller-id/types";

const PAGE_SIZE = 5;

function matchesSearch(record: CallerIdRecord, search: string) {
  if (!search.trim()) return true;
  const query = search.toLowerCase();
  return (
    record.label.toLowerCase().includes(query) ||
    record.phoneNumber.toLowerCase().includes(query) ||
    record.region.toLowerCase().includes(query) ||
    record.assignedTo?.toLowerCase().includes(query)
  );
}

export function useCallerId() {
  const [records, setRecords] = useState<CallerIdRecord[]>(callerIdRecords);
  const [filters, setFilters] = useState<CallerIdFilters>(DEFAULT_CALLER_ID_FILTERS);
  const [page, setPage] = useState(1);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      if (filters.type !== "all" && record.type !== filters.type) return false;
      if (filters.verification !== "all" && record.verification !== filters.verification) {
        return false;
      }
      return matchesSearch(record, filters.search);
    });
  }, [records, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));

  const paginatedRecords = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredRecords.slice(start, start + PAGE_SIZE);
  }, [filteredRecords, page]);

  const updateFilters = useCallback((next: Partial<CallerIdFilters>) => {
    setFilters((prev) => ({ ...prev, ...next }));
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_CALLER_ID_FILTERS);
    setPage(1);
  }, []);

  const setDefault = useCallback((id: string) => {
    setRecords((prev) =>
      prev.map((record) => ({
        ...record,
        isDefault: record.id === id,
      }))
    );
  }, []);

  const addRecord = useCallback((form: AddCallerIdForm) => {
    const newRecord: CallerIdRecord = {
      id: `cid-${Date.now()}`,
      label: form.label,
      phoneNumber: form.phoneNumber,
      region: form.region,
      type: form.type,
      verification: "pending",
      isDefault: false,
      addedAt: new Date().toISOString(),
    };
    setRecords((prev) => [newRecord, ...prev]);
    setPage(1);
  }, []);

  const verifiedCount = records.filter((r) => r.verification === "verified").length;
  const pendingCount = records.filter((r) => r.verification === "pending").length;

  return {
    records: paginatedRecords,
    filters,
    updateFilters,
    resetFilters,
    setDefault,
    addRecord,
    page,
    setPage,
    totalPages,
    totalRecords: filteredRecords.length,
    pageSize: PAGE_SIZE,
    verifiedCount,
    pendingCount,
    totalCount: records.length,
  };
}
