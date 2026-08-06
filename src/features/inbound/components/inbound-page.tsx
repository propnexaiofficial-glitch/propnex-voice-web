"use client";

import { useState } from "react";
import { PhoneIncoming } from "lucide-react";
import { motion } from "framer-motion";

import { CallLogTable } from "@/components/tables/call-log-table";
import { TablePagination } from "@/components/tables/table-pagination";
import { EmptyState } from "@/components/common/empty-state";
import { InboundFilters } from "@/features/inbound/components/inbound-filters";
import { TranscriptDrawer } from "@/components/common/transcript-drawer";
import { useInboundCalls } from "@/features/inbound/hooks/use-inbound-calls";
import type { CallRecord } from "@/types/call";

export function InboundPageContent() {
  const {
    filters,
    updateFilters,
    resetFilters,
    calls,
    totalCalls,
    page,
    totalPages,
    pageSize,
    setPage,
  } = useInboundCalls();

  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);
  const [transcriptOpen, setTranscriptOpen] = useState(false);

  const handleViewTranscript = (call: CallRecord) => {
    setSelectedCall(call);
    setTranscriptOpen(true);
  };

  return (
    <div className="space-y-6">
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
              Monitor incoming calls handled by your AI voice agent
            </p>
          </div>
        </div>
      </motion.div>

      <InboundFilters
        filters={filters}
        onChange={updateFilters}
        onReset={resetFilters}
      />

      {calls.length === 0 ? (
        <EmptyState
          title="No calls found"
          description="Try adjusting your search or filter criteria to find call records."
        />
      ) : (
        <>
          <CallLogTable
            calls={calls}
            variant="inbound"
            onViewTranscript={handleViewTranscript}
          />
          <TablePagination
            page={page}
            totalPages={totalPages}
            totalItems={totalCalls}
            pageSize={pageSize}
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
