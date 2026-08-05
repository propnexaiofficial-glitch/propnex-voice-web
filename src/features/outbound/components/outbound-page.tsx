"use client";

import { useState } from "react";
import { PhoneOutgoing } from "lucide-react";
import { motion } from "framer-motion";

import { TranscriptDrawer } from "@/components/common/transcript-drawer";
import { EmptyState } from "@/components/common/empty-state";
import { CallLogFiltersBar } from "@/components/forms/call-log-filters";
import { CallLogTable } from "@/components/tables/call-log-table";
import { TablePagination } from "@/components/tables/table-pagination";
import { CampaignCard } from "@/features/outbound/components/campaign-card";
import { UploadCsvModal } from "@/features/outbound/components/upload-csv-modal";
import { useCampaign } from "@/features/outbound/hooks/use-campaign";
import { useOutboundCalls } from "@/features/outbound/hooks/use-outbound-calls";
import type { CallRecord } from "@/types/call";

export function OutboundPageContent() {
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
  } = useOutboundCalls();

  const {
    campaign,
    progressPercent,
    handleUpload,
    startCampaign,
    pauseCampaign,
    resumeCampaign,
  } = useCampaign();

  const [uploadOpen, setUploadOpen] = useState(false);
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
        className="flex items-center gap-2"
      >
        <div className="flex size-9 items-center justify-center rounded-lg bg-blue-500/15">
          <PhoneOutgoing className="size-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Outbound Call Logs</h2>
          <p className="text-sm text-muted-foreground">
            Manage campaigns and monitor outgoing AI voice calls
          </p>
        </div>
      </motion.div>

      <CampaignCard
        campaign={campaign}
        progressPercent={progressPercent}
        onUploadClick={() => setUploadOpen(true)}
        onStart={startCampaign}
        onPause={pauseCampaign}
        onResume={resumeCampaign}
      />

      <CallLogFiltersBar
        filters={filters}
        onChange={updateFilters}
        onReset={resetFilters}
        searchId="outbound-search"
      />

      {calls.length === 0 ? (
        <EmptyState
          title="No outbound calls found"
          description="Adjust your filters or start a campaign to see call records here."
        />
      ) : (
        <>
          <CallLogTable calls={calls} onViewTranscript={handleViewTranscript} />
          <TablePagination
            page={page}
            totalPages={totalPages}
            totalItems={totalCalls}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </>
      )}

      <UploadCsvModal
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUpload={handleUpload}
      />

      <TranscriptDrawer
        call={selectedCall}
        open={transcriptOpen}
        onOpenChange={setTranscriptOpen}
      />
    </div>
  );
}
