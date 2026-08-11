"use client";

import { useState } from "react";
import { PhoneIncoming, RefreshCcw, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

import { CallLogTable } from "@/components/tables/call-log-table";
import { TablePagination } from "@/components/tables/table-pagination";
import { EmptyState } from "@/components/common/empty-state";
import { InboundFilters } from "@/features/inbound/components/inbound-filters";
import { TranscriptDrawer } from "@/components/common/transcript-drawer";
import { useInboundCalls } from "@/features/inbound/hooks/use-inbound-calls";
import {
  DEFAULT_CALL_FILTERS,
  type CallLogFilters,
  type CallRecord,
} from "@/types/call";

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function TableSkeleton() {
  return (
    <div className="rounded-xl border border-border overflow-hidden animate-pulse">
      <div className="bg-muted/40 h-12 w-full" />
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="h-14 w-full bg-background border-t border-border flex items-center gap-4 px-4"
        >
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="h-4 w-20 rounded bg-muted flex-1" />
          <div className="h-6 w-20 rounded-full bg-muted" />
          <div className="h-4 w-16 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

// ─── Error banner ─────────────────────────────────────────────────────────────
function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
      <div className="flex items-center gap-2">
        <AlertCircle className="size-4 shrink-0" />
        <span>{message}</span>
      </div>
      <button
        onClick={onRetry}
        className="flex items-center gap-1.5 rounded-md border border-destructive/30 px-3 py-1 text-xs font-medium hover:bg-destructive/10 transition-colors"
      >
        <RefreshCcw className="size-3" />
        Retry
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function InboundPageContent() {
  const {
    filters,
    updateFilters: handleFiltersChange,
    resetFilters: handleResetFilters,
    calls,
    totalCalls: total,
    page,
    totalPages,
    pageSize,
    setPage,
  } = useInboundCalls();
  
  const loading = false;
  const error = null;

  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);
  const [transcriptOpen, setTranscriptOpen] = useState(false);

  const handleViewTranscript = (call: CallRecord) => {
    setSelectedCall(call);
    setTranscriptOpen(true);
  };

  const handleRetry = () => {};

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-1"
      >
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
            <PhoneIncoming className="size-5 text-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Inbound Call Logs</h2>
            <p className="text-sm text-muted-foreground">
              {loading
                ? "Loading incoming calls…"
                : error
                  ? "Could not load calls from server"
                  : total > 0
                    ? `${total} incoming call${total === 1 ? "" : "s"} found`
                    : "Monitor incoming calls handled by your AI voice agent"}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Filters ── */}
      <InboundFilters
        filters={filters}
        onChange={handleFiltersChange}
        onReset={handleResetFilters}
      />

      {/* ── Error ── */}
      {error && !loading && (
        <ErrorBanner message={error} onRetry={handleRetry} />
      )}

      {/* ── Content ── */}
      {loading ? (
        <TableSkeleton />
      ) : calls.length === 0 && !error ? (
        <EmptyState
          title="No calls found"
          description="Try adjusting your search or filter criteria to find call records."
        />
      ) : !error ? (
        <>
          <CallLogTable
            calls={calls}
            variant="inbound"
            onViewTranscript={handleViewTranscript}
          />
          <TablePagination
            page={page}
            totalPages={totalPages}
            totalItems={total}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </>
      ) : null}

      {/* ── Transcript drawer ── */}
      <TranscriptDrawer
        call={selectedCall}
        open={transcriptOpen}
        onOpenChange={setTranscriptOpen}
      />
    </div>
  );
}
