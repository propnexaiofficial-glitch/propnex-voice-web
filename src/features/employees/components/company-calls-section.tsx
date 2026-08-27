"use client";

import { useMemo, useState, useEffect } from "react";
import { PhoneIncoming, PhoneOutgoing, Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { TranscriptDrawer } from "@/components/common/transcript-drawer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CallLogFiltersBar } from "@/components/forms/call-log-filters";
import { CallLogTable } from "@/components/tables/call-log-table";
import { TablePagination } from "@/components/tables/table-pagination";
import { useInboundCallsApi, INBOUND_API_PAGE_SIZE } from "@/features/inbound/hooks/use-inbound-calls-api";
import { UploadCsvModal } from "@/features/outbound/components/upload-csv-modal";
import { CampaignCard } from "@/features/outbound/components/campaign-card";
import { useCampaign } from "@/features/outbound/hooks/use-campaign";
import { leadReactivationCampaign } from "@/features/outbound/data";
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
  const { getCompanyById, companies, loading: isContextLoading } = useEmployeesContext();
  const company = companies.find((c) => c.id === companyId);
  const isOutOfCredits = (company?.creditsRemaining ?? 0) <= 0;
  const isLocked = company?.status === "SUSPENDED" || company?.status === "DELETED";

  const hasAssignedNumber = useMemo(() => {
    if (isContextLoading) return true;
    if (!company?.assignedNumbers) return false;
    if (direction === "outbound") {
      return company.assignedNumbers.some((n: any) => n.direction === "OUTBOUND" || n.direction === "BOTH");
    }
    return company.assignedNumbers.some((n: any) => n.direction === "INBOUND" || n.direction === "BOTH");
  }, [company, isContextLoading, direction]);

  const {
    campaign: outboundCampaign,
    progressPercent,
    handleUpload: handleCampaignUpload,
    startCampaign,
    pauseCampaign,
    resumeCampaign,
    editLead,
    deleteLead,
    alertData,
    setAlertData,
  } = useCampaign();

  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleDid, setRescheduleDid] = useState("");
  const [reactivationCampaign, setReactivationCampaign] = useState<any>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`reactivation_state_${companyId || 'default'}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return leadReactivationCampaign;
  });

  const [isCleared, setIsCleared] = useState(false);
  useEffect(() => {
    setIsCleared(!!(typeof window !== "undefined" && localStorage.getItem(`reactivation_cleared_${companyId || 'default'}_${outboundCampaign?.id}`)));
  }, [companyId, outboundCampaign?.id, reactivationCampaign]);

  const shouldShowReactivation = hasAssignedNumber && !isCleared;

  useEffect(() => {
    // Poll to check if a scheduled reactivation has passed its time
    if (reactivationCampaign?.status === "scheduled" && reactivationCampaign?.scheduledAt) {
      const interval = setInterval(() => {
        if (Date.now() >= new Date(reactivationCampaign.scheduledAt).getTime()) {
          // Time passed, calls are sent. Remove from reactivation area.
          localStorage.removeItem(`reactivation_state_${companyId || 'default'}`);
          localStorage.setItem(`reactivation_cleared_${companyId || 'default'}_${outboundCampaign?.id}`, "true");
          setReactivationCampaign(leadReactivationCampaign);
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [reactivationCampaign, companyId, outboundCampaign?.id]);

  // Removed the useEffect that automatically opened the reschedule modal on load

  const handleReschedule = async () => {
    try {
      setIsRescheduling(true);
      const token = localStorage.getItem("accessToken") || localStorage.getItem("access_token");
      
      const failedLeads = outboundCampaign.leads?.filter((l: any) => l.isFailed) || [];
      const scheduledAt = new Date(`${rescheduleDate}T${rescheduleTime}`).toISOString();
      const didNumber = rescheduleDid || outboundCampaign.selectedDid || company?.assignedNumbers?.find((n: any) => n.direction === "OUTBOUND" || n.direction === "BOTH")?.number;

      // Derive channels from selected DID's config
      const didInfo = (company?.assignedNumbers as any[] || []).find((n: any) => n.number === didNumber);
      const channels = didInfo?.channels ?? 1;

      if (!didNumber) {
        throw new Error("Please select an outbound number to use for reactivation.");
      }

      if (failedLeads.length === 0) {
        throw new Error("No failed leads to reschedule.");
      }

      const res = await fetch("/api/calls/reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          campaignId: outboundCampaign.id || "manual",
          leads: failedLeads,
          scheduledAt,
          didNumber,
          channels
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to reschedule calls");
      }
      
      setAlertData({
        title: "Reactivation Scheduled ✓",
        description: `Successfully scheduled ${failedLeads.length} failed call(s) for ${new Date(scheduledAt).toLocaleString()}.`
      });
      const newState = {
        ...leadReactivationCampaign,
        status: "scheduled",
        scheduledAt,
        totalContacts: failedLeads.length,
        leads: failedLeads.map((l: any) => ({ ...l, isFailed: false, called: false }))
      };
      setReactivationCampaign(newState);
      localStorage.setItem(`reactivation_state_${companyId || 'default'}`, JSON.stringify(newState));
      
      setRescheduleOpen(false);
    } catch (e: any) {
      setAlertData({ title: "Error", description: e.message, isError: true });
    } finally {
      setIsRescheduling(false);
    }
  };


  const [isRequestLocked, setIsRequestLocked] = useState(false);
  const [reminding, setReminding] = useState(false);
  const [remindMessage, setRemindMessage] = useState<{text: string, type: string} | null>(null);

  useEffect(() => {
    const key = `last_${direction}_number_request_${companyId}`;
    
    if (hasAssignedNumber) {
      // If they already have a number, clear the lock and don't show the error
      localStorage.removeItem(key);
      setIsRequestLocked(false);
      setRemindMessage(null);
      return;
    }

    const lastRequest = localStorage.getItem(key);
    if (lastRequest) {
      const hoursSince = (Date.now() - parseInt(lastRequest)) / (1000 * 60 * 60);
      if (hoursSince < 24) {
        setIsRequestLocked(true);
        setRemindMessage({ text: "You can only request once every 24 hours.", type: "error" });
      } else {
        localStorage.removeItem(key);
      }
    }
  }, [direction, companyId, hasAssignedNumber]);

  const handleRemindAdmin = async () => {
    try {
      setReminding(true);
      setRemindMessage(null);
      const token = localStorage.getItem("accessToken") || localStorage.getItem("access_token");
      const storedUserStr = localStorage.getItem("user");
      const user = storedUserStr ? JSON.parse(storedUserStr) : {};
      const email = user.email || user.id || "default";

      const adminBase = process.env.NEXT_PUBLIC_ADMIN_URL || "https://admin.propnexai.com";
      const res = await fetch(`${adminBase}/api/number-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          companyId,
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown",
          type: direction.toUpperCase()
        })
      });

      if (res.ok) {
        setRemindMessage({ text: "Reminder sent successfully! Admin notified.", type: "success" });
        localStorage.setItem(`last_${direction}_number_request_${companyId}`, Date.now().toString());
        setIsRequestLocked(true);
      } else if (res.status === 429) {
        setRemindMessage({ text: "You can only request once every 24 hours.", type: "error" });
        localStorage.setItem(`last_${direction}_number_request_${companyId}`, Date.now().toString());
        setIsRequestLocked(true);
      } else {
        setRemindMessage({ text: "Failed to send reminder. Please try again.", type: "error" });
      }
    } catch (e) {
      setRemindMessage({ text: "Error sending reminder.", type: "error" });
    }
    setReminding(false);
  };

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

  const handleUpload = (fileName: string, leads: any[] = [], selectedDid?: string, channels?: number) => {
    handleCampaignUpload(fileName, leads, selectedDid, channels ?? 1);
    setUploadOpen(false);
  };

  return (
    <div className="space-y-5">
      {direction === "outbound" ? (
        <>
        {shouldShowReactivation && (
          <CampaignCard
            campaign={{ ...reactivationCampaign, leads: reactivationCampaign.status === "idle" ? outboundCampaign.leads?.filter((l: any) => l.isFailed) : reactivationCampaign.leads }}
            progressPercent={0}
            onUploadClick={() => {}}
            onStart={() => {}}
            onPause={() => {}}
            onResume={() => {}}
            onSchedule={() => setRescheduleOpen(true)}
            failedCallsCount={outboundCampaign.failedCalls}
            hasOutboundNumber={hasAssignedNumber}
            companyId={companyId}
          />
        )}
          <CampaignCard
            campaign={hasAssignedNumber ? outboundCampaign : { ...outboundCampaign, status: "idle", leads: [], failedCalls: 0, completedCalls: 0 }}
            progressPercent={hasAssignedNumber ? progressPercent : 0}
            onUploadClick={() => setUploadOpen(true)}
            onStart={startCampaign}
            onPause={pauseCampaign}
            onResume={resumeCampaign}
            onEditLead={editLead}
            onDeleteLead={deleteLead}
            hasOutboundNumber={hasAssignedNumber}
            companyId={companyId}
          />
        </>
      ) : (
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

          {!isLocked && (
            <div className="flex flex-col gap-2 items-end">
              {!hasAssignedNumber ? (
                <Button onClick={handleRemindAdmin} disabled={reminding || isRequestLocked} className="gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white">
                  <PhoneIncoming className="size-4" />
                  {reminding ? "Sending..." : (isRequestLocked ? "Request Sent" : "Request Inbound Number")}
                </Button>
              ) : null}
              {remindMessage && (
                <p className={`text-xs ${remindMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {remindMessage.text}
                </p>
              )}
            </div>
          )}
        </motion.div>
      )}

      <CallLogFiltersBar
        filters={filters}
        onChange={updateFilters}
        onReset={resetFilters}
        searchId={`${companyId}-${direction}-search`}
        hideAssignedNumber={false}
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

      <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reschedule Failed Calls</DialogTitle>
            <DialogDescription>
              {outboundCampaign.failedCalls} calls failed during the campaign (via {outboundCampaign.selectedDid || "your assigned number"}). Select a date and time to automatically retry them using the Lead Reactivation queue.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* DID selector for sub-company reschedule */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Outbound Number (DID)</label>
              <select
                value={rescheduleDid}
                onChange={(e) => setRescheduleDid(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
              >
                <option value="">— Select number —</option>
                {(company?.assignedNumbers as any[] || []).filter((n: any) => !n.direction || n.direction === "OUTBOUND" || n.direction === "BOTH").map((n: any) => (
                  <option key={n.id || n.number} value={n.number}>
                    {n.number}{n.channels ? ` (Ch ${n.channels})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Failed Leads ({(outboundCampaign.leads || []).filter((l: any) => l.isFailed).length})</label>
              <div className="max-h-40 overflow-y-auto rounded-md border border-border bg-muted/30 p-2 text-sm">
                {(outboundCampaign.leads || []).filter((l: any) => l.isFailed).map((lead: any, i: number) => (
                  <div key={i} className="flex justify-between border-b border-border/50 py-1 last:border-0">
                    <span>{lead.name}</span>
                    <span className="font-mono text-muted-foreground">{lead.phone}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <input 
                  type="date" 
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" 
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Time</label>
                <input 
                  type="time" 
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" 
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleOpen(false)}>Cancel</Button>
            <Button onClick={handleReschedule} disabled={isRescheduling || !rescheduleDate || !rescheduleTime || !rescheduleDid}>
              {isRescheduling ? "Scheduling..." : "Schedule Reactivation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!alertData} onOpenChange={(open) => !open && setAlertData(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {alertData?.isError ? (
                <AlertCircle className="h-5 w-5 text-destructive" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
              {alertData?.title}
            </DialogTitle>
            <DialogDescription>
              {alertData?.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => setAlertData(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {direction === "outbound" && (
        <UploadCsvModal
          open={uploadOpen}
          onOpenChange={setUploadOpen}
          onUpload={handleUpload}
          title="Upload CSV — Sub-Company Outbound"
          description="Upload a contact list to launch a general outbound calling campaign for this sub-company. CSV should include a phone number column."
          didNumbers={company?.assignedNumbers as any}
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
