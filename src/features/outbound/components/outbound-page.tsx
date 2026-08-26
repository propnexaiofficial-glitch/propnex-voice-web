"use client";

import { useState } from "react";
import { PhoneOutgoing } from "lucide-react";
import { motion } from "framer-motion";

import { TranscriptDrawer } from "@/components/common/transcript-drawer";
import { useEffect } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { CallLogFiltersBar } from "@/components/forms/call-log-filters";
import { CallLogTable } from "@/components/tables/call-log-table";
import { TablePagination } from "@/components/tables/table-pagination";
import { CampaignCard } from "@/features/outbound/components/campaign-card";
import { UploadCsvModal } from "@/features/outbound/components/upload-csv-modal";
import { leadReactivationCampaign } from "@/features/outbound/data";
import { useCampaign } from "@/features/outbound/hooks/use-campaign";
import { useOutboundCalls } from "@/features/outbound/hooks/use-outbound-calls";
import type { CallRecord } from "@/types/call";
import { useUserContext } from "@/features/auth/context/user-context";

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
    loading,
    error,
  } = useOutboundCalls();

  const {
    campaign: outboundCampaign,
    progressPercent,
    handleUpload,
    startCampaign,
    pauseCampaign,
    resumeCampaign,
    editLead,
  } = useCampaign();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);
  const [transcriptOpen, setTranscriptOpen] = useState(false);

  const handleViewTranscript = (call: CallRecord) => {
    setSelectedCall(call);
    setTranscriptOpen(true);
  };

  const { user, isLoading } = useUserContext();
  const hasOutboundNumber = isLoading ? true : (user?.assignedNumbersDetailed?.some(
    (n: any) => !n.direction || n.direction === "OUTBOUND" || n.direction === "BOTH"
  ) ?? false);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2"
      >
        <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
          <PhoneOutgoing className="size-5 text-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Outbound Call Logs</h2>
          <p className="text-sm text-muted-foreground">
            Manage campaigns and monitor outgoing AI voice calls
          </p>
        </div>
      </motion.div>

      <div className="space-y-4">
        <CampaignCard
          campaign={leadReactivationCampaign}
          progressPercent={0}
          onUploadClick={() => undefined}
          onStart={() => undefined}
          onPause={() => undefined}
          onResume={() => undefined}
        />

        <CampaignCard
          campaign={outboundCampaign}
          progressPercent={progressPercent}
          hasOutboundNumber={hasOutboundNumber}
          onUploadClick={() => setUploadOpen(true)}
          onStart={startCampaign}
          onPause={pauseCampaign}
          onResume={resumeCampaign}
          onEditLead={editLead}
        />
      </div>

      <CallLogFiltersBar
        filters={filters}
        onChange={updateFilters}
        onReset={resetFilters}
        searchId="outbound-search"
        loading={loading}
      />

      {error ? (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <div className="flex items-center gap-2">
            <span>{error}</span>
          </div>
        </div>
      ) : calls.length === 0 && !loading ? (
        <EmptyState
          title="No outbound calls found"
          description="Adjust your filters or start a campaign to see call records here."
        />
      ) : (
        <>
          {loading ? (
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
          ) : (
            <>
              <CallLogTable
                calls={calls}
                variant="outbound"
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
        </>
      )}

      <UploadCsvModal
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUpload={handleUpload}
        title="Upload CSV — Outbound"
        description="Upload a contact list to launch a general outbound calling campaign. CSV should include a phone number column."
      />

      <TranscriptDrawer
        call={selectedCall}
        open={transcriptOpen}
        onOpenChange={setTranscriptOpen}
      />
    </div>
  );
}
