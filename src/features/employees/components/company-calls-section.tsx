"use client";

import { useMemo, useState } from "react";
import { PhoneIncoming, PhoneOutgoing } from "lucide-react";
import { motion } from "framer-motion";

import { EmptyState } from "@/components/common/empty-state";
import { TranscriptDrawer } from "@/components/common/transcript-drawer";
import { CallLogFiltersBar } from "@/components/forms/call-log-filters";
import { CallLogTable } from "@/components/tables/call-log-table";
import { TablePagination } from "@/components/tables/table-pagination";
import {
  companyInboundCalls,
  companyOutboundCalls,
} from "@/features/employees/data";
import {
  DEFAULT_CALL_FILTERS,
  type CallLogFilters,
  type CallRecord,
} from "@/types/call";

const PAGE_SIZE = 5;

type CompanyCallsSectionProps = {
  companyId: string;
  direction: "inbound" | "outbound";
};

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

export function CompanyCallsSection({
  companyId,
  direction,
}: CompanyCallsSectionProps) {
  const source =
    direction === "inbound"
      ? companyInboundCalls[companyId] ?? []
      : companyOutboundCalls[companyId] ?? [];

  const [filters, setFilters] = useState<CallLogFilters>(DEFAULT_CALL_FILTERS);
  const [page, setPage] = useState(1);
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);
  const [transcriptOpen, setTranscriptOpen] = useState(false);

  const filteredCalls = useMemo(() => {
    return source.filter(
      (call) =>
        matchesSearch(call, filters.search) &&
        matchesStatus(call, filters.status) &&
        matchesDateRange(call, filters.dateFrom, filters.dateTo)
    );
  }, [source, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredCalls.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const paginatedCalls = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredCalls.slice(start, start + PAGE_SIZE);
  }, [filteredCalls, currentPage]);

  const updateFilters = (next: CallLogFilters) => {
    setFilters(next);
    setPage(1);
  };

  const resetFilters = () => {
    setFilters(DEFAULT_CALL_FILTERS);
    setPage(1);
  };

  const Icon = direction === "inbound" ? PhoneIncoming : PhoneOutgoing;
  const title = direction === "inbound" ? "Inbound Calls" : "Outbound Calls";
  const description =
    direction === "inbound"
      ? "Incoming calls handled for this sub-company"
      : "Outgoing campaigns and calls for this sub-company";

  const handleViewTranscript = (call: CallRecord) => {
    setSelectedCall(call);
    setTranscriptOpen(true);
  };

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2"
      >
        <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
          <Icon className="size-5 text-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </motion.div>

      <CallLogFiltersBar
        filters={filters}
        onChange={updateFilters}
        onReset={resetFilters}
        searchId={`${companyId}-${direction}-search`}
      />

      {paginatedCalls.length === 0 ? (
        <EmptyState
          title={`No ${direction} calls yet`}
          description="Call records for this sub-company will appear here once available."
        />
      ) : (
        <>
          <CallLogTable
            calls={paginatedCalls}
            variant={direction}
            onViewTranscript={handleViewTranscript}
          />
          <TablePagination
            page={currentPage}
            totalPages={totalPages}
            totalItems={filteredCalls.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </>
      )}

      <TranscriptDrawer
        call={selectedCall}
        open={transcriptOpen}
        onOpenChange={setTranscriptOpen}
      />
    </div>
  );
}
