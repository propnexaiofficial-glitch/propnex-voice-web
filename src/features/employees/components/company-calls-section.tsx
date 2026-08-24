"use client";

import { useMemo, useState } from "react";
import { PhoneIncoming, PhoneOutgoing, Upload } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { TranscriptDrawer } from "@/components/common/transcript-drawer";
import { CallLogFiltersBar } from "@/components/forms/call-log-filters";
import { CallLogTable } from "@/components/tables/call-log-table";
import { TablePagination } from "@/components/tables/table-pagination";
import { useInboundCallsApi, INBOUND_API_PAGE_SIZE } from "@/features/inbound/hooks/use-inbound-calls-api";
import { UploadCsvModal } from "@/features/outbound/components/upload-csv-modal";
import { TransferCreditsModal } from "@/features/employees/components/transfer-credits-modal";
import {
  DEFAULT_CALL_FILTERS,
  type CallLogFilters,
  type CallRecord,
} from "@/types/call";

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

import { useEmployeesContext } from "@/features/employees/context/employees-context";

export function CompanyCallsSection({
  companyId,
  direction,
}: CompanyCallsSectionProps) {
  const { getCompanyById } = useEmployeesContext();
  const company = getCompanyById(companyId);
  const isOutOfCredits = (company?.creditsRemaining ?? 0) <= 0;
  const isLocked = !company?.contactPhone || isOutOfCredits;

  const [filters, setFilters] = useState<CallLogFilters>(DEFAULT_CALL_FILTERS);
  const [page, setPage] = useState(1);
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  const {
    calls: paginatedCalls,
    total: totalItems,
    totalPages,
    loading,
    error,
  } = useInboundCallsApi(filters, page, 0, true, companyId, direction);

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

  const handleUpload = (fileName: string) => {
    // In a real app, this would process the CSV and start the campaign.
    // For now, it just closes the modal.
    setUploadOpen(false);
  };

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
            <Icon className="size-5 text-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        {direction === "outbound" && !isLocked && (
          <Button variant="outline" className="gap-2" onClick={() => setUploadOpen(true)}>
            <Upload className="size-4" />
            Upload CSV
          </Button>
        )}
      </motion.div>

      <CallLogFiltersBar
        filters={filters}
        onChange={updateFilters}
        onReset={resetFilters}
        searchId={`${companyId}-${direction}-search`}
        hideAssignedNumber={true}
        loading={loading}
      />

      {isLocked ? (
        <EmptyState
          title={isOutOfCredits ? "Locked (0 Credits)" : "Phone Number Pending"}
          description={isOutOfCredits ? "This sub-company has run out of credits. Please add credits to restore access to call logs and capabilities." : "Please wait for the admin to assign a phone number to unlock this feature."}
        >
          {isOutOfCredits && (
            <Button onClick={() => setTransferOpen(true)} className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
              Add Credits
            </Button>
          )}
        </EmptyState>
      ) : paginatedCalls.length === 0 ? (
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
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={INBOUND_API_PAGE_SIZE}
            onPageChange={setPage}
          />
        </>
      )}

      <TranscriptDrawer
        call={selectedCall}
        open={transcriptOpen}
        onOpenChange={setTranscriptOpen}
      />

      {direction === "outbound" && (
        <UploadCsvModal
          open={uploadOpen}
          onOpenChange={setUploadOpen}
          onUpload={handleUpload}
          title="Upload CSV — Sub-Company Outbound"
          description="Upload a contact list to launch a general outbound calling campaign for this sub-company. CSV should include a phone number column."
        />
      )}

      {company && (
        <TransferCreditsModal
          company={company}
          open={transferOpen}
          onOpenChange={setTransferOpen}
        />
      )}
    </div>
  );
}
