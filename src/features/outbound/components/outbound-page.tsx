"use client";

import { useState } from "react";
import { PhoneOutgoing, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
import { CompletionAnimation } from "@/components/ui/completion-animation";

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
    deleteLead,
    clearCampaign,
    forceStopCampaign,
    clearFailedCalls,
    alertData,
    setAlertData,
    isInitializing,
  } = useCampaign();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);

  const { user, isLoading } = useUserContext();
  const hasOutboundNumber = user?.role === "SYSTEM_ADMIN" || (user?.assignedNumbersDetailed && user.assignedNumbersDetailed.some((n: any) => n.direction === "OUTBOUND" || n.direction === "BOTH"));

  const [editCampaignId, setEditCampaignId] = useState<string | null>(null);
  const [animationState, setAnimationState] = useState<{title: string, subtitle?: string, type?: "campaign" | "schedule" | "force_stopped"} | null>(null);
  const [scheduleHistoryList, setScheduleHistoryList] = useState<any[]>([]);

  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [dateError, setDateError] = useState("");
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleDid, setRescheduleDid] = useState("");
  const [persistentFailedLeads, setPersistentFailedLeads] = useState<any[]>([]);
  const [persistentFailedLeadsInfo, setPersistentFailedLeadsInfo] = useState<any>({});

  useEffect(() => {
    const saved = localStorage.getItem("pnx_persistent_failed_leads");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Deduplicate on load in case stale data has duplicates
        const seen = new Set<string>();
        const deduped = parsed.filter((lead: any) => {
          const key = (lead.phone || "").replace(/\D/g, "").slice(-10);
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        localStorage.setItem("pnx_persistent_failed_leads", JSON.stringify(deduped));
        setPersistentFailedLeads(deduped);
      } catch (e) {}
    }
    const savedInfoStr = localStorage.getItem("pnx_persistent_failed_leads_info");
    if (savedInfoStr) {
      try {
        setPersistentFailedLeadsInfo(JSON.parse(savedInfoStr));
      } catch (e) {}
    }
    // Load schedule history
  }, []);

  useEffect(() => {
    const schedulesJSON = localStorage.getItem("pnx_reactivation_schedules");
    const legacyJSON = localStorage.getItem("pnx_reactivation_schedule");
    let allSchedules: any[] = [];
    let needsSave = false;

    if (schedulesJSON) {
      try {
        const parsed = JSON.parse(schedulesJSON);
        if (Array.isArray(parsed)) allSchedules = [...parsed];
      } catch (e) {}
    }

    if (legacyJSON) {
      try {
        const parsedLegacy = JSON.parse(legacyJSON);
        if (parsedLegacy && parsedLegacy.scheduledAt) {
          // Check if this legacy schedule is already in allSchedules
          const exists = allSchedules.some(s => s.scheduledAt === parsedLegacy.scheduledAt && s.csvName === parsedLegacy.csvName);
          if (!exists) {
            allSchedules.push(parsedLegacy);
            needsSave = true;
          }
        }
      } catch (e) {}
    }

    if (allSchedules.length > 0) {
      const now = Date.now();
      const valid = allSchedules.filter((s: any) => new Date(s.scheduledAt).getTime() > now - 86400000);
      setScheduleHistoryList(valid);
      
      if (needsSave || legacyJSON) {
        localStorage.setItem("pnx_reactivation_schedules", JSON.stringify(valid));
        localStorage.removeItem("pnx_reactivation_schedule"); // Clear legacy
      }
    } else {
      localStorage.removeItem("pnx_reactivation_schedule"); // Clear legacy if invalid/empty
    }
  }, []);

  const handleAnimationComplete = () => {
    setAnimationState(null);
    // Clearing logic is now handled instantly when alertData triggers the animation
  };

  useEffect(() => {
    if (!rescheduleDate || !rescheduleTime) {
      setDateError("");
      return;
    }
    
    const selectedDate = new Date(`${rescheduleDate}T${rescheduleTime}`);
    const now = new Date();
    
    if (selectedDate <= now) {
      setDateError("Date and time must be in the future.");
    } else {
      setDateError("");
    }
  }, [rescheduleDate, rescheduleTime]);

  // Intercept alertData to show animation instead if it matches success criteria
  useEffect(() => {
    if (alertData && !alertData.isError) {
      if (alertData.title === "Campaign Completed" || alertData.title === "Campaign Force Stopped") {
        setAnimationState({
          title: alertData.title,
          subtitle: alertData.description,
          type: alertData.title === "Campaign Force Stopped" ? "force_stopped" : "campaign",
        });
        setAlertData(null);

        // Clear campaign state IMMEDIATELY so the card resets to "No Campaign" right away
        if (!outboundCampaign.isReactivation && (alertData.title === "Campaign Completed" || alertData.title === "Campaign Force Stopped")) {
          const newlyFailed = outboundCampaign.leads?.filter((l: any) => l.isFailed) || [];
          if (newlyFailed.length > 0) {
            setPersistentFailedLeads(prev => {
              const combined = [...prev, ...newlyFailed];
              const seen = new Set<string>();
              const deduped = combined.filter((lead: any) => {
                const key = (lead.phone || "").replace(/\D/g, "").slice(-10);
                if (!key || seen.has(key)) return false;
                seen.add(key);
                return true;
              });
              localStorage.setItem("pnx_persistent_failed_leads", JSON.stringify(deduped));
              const info = {
                selectedDid: outboundCampaign.selectedDid,
                channels: outboundCampaign.channels,
                uploadedFileName: outboundCampaign.uploadedFileName
              };
              localStorage.setItem("pnx_persistent_failed_leads_info", JSON.stringify(info));
              setPersistentFailedLeadsInfo(info);
              return deduped;
            });
          }
        } else if (outboundCampaign.isReactivation && (alertData.title === "Campaign Completed" || alertData.title === "Campaign Force Stopped")) {
          setPersistentFailedLeads([]);
          setPersistentFailedLeadsInfo({});
          localStorage.removeItem("pnx_persistent_failed_leads");
          localStorage.removeItem("pnx_persistent_failed_leads_info");
          // NOTE: We only remove the schedule history for the one that just completed!
          // But actually, we don't clear the entire array anymore, we'll handle that differently.
        }
        clearCampaign(); 
        
      } else if (alertData.title.includes("Scheduled") || alertData.title.includes("Reactivation Scheduled")) {
        setAnimationState({
          title: alertData.title.replace(" ✓", ""),
          subtitle: alertData.description,
          type: "schedule",
        });
        setAlertData(null);
      }
    }
  }, [alertData, setAlertData, clearCampaign, outboundCampaign.isReactivation, outboundCampaign.leads]);

  const handleReschedule = async () => {
    try {
      setIsRescheduling(true);
      const token = localStorage.getItem("accessToken") || localStorage.getItem("access_token");
      const fallbackLeads = outboundCampaign.leads?.filter((l: any) => l.isFailed) || [];
      const failedLeads = persistentFailedLeads.length > 0 ? persistentFailedLeads : fallbackLeads;
      
      const scheduledAt = new Date(`${rescheduleDate}T${rescheduleTime}`).toISOString();
      const didNumber = rescheduleDid || persistentFailedLeadsInfo?.selectedDid || outboundCampaign.selectedDid || user?.assignedNumbersDetailed?.[0]?.number;
      const channels = persistentFailedLeadsInfo?.channels || outboundCampaign.channels || user?.assignedNumbersDetailed?.[0]?.channels ?? 1;
      const uploadedFileName = persistentFailedLeadsInfo?.uploadedFileName || outboundCampaign.uploadedFileName || "Lead Reactivation";

      if (!didNumber) throw new Error("Please select an outbound number to use for reactivation.");
      if (failedLeads.length === 0) throw new Error("No failed leads to reschedule.");

      const res = await fetch("/api/calls/reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          campaignId: outboundCampaign.id || "manual",
          leads: failedLeads,
          scheduledAt,
          didNumber,
          channels,
          uploadedFileName,
        })
      });

      if (!res.ok) throw new Error("Failed to reschedule calls");

      // Save schedule history to localStorage so it persists across refreshes
      const historyEntry = { 
        scheduledAt, 
        did: didNumber,
        channels: channels,
        createdAt: Date.now(),
        leadsCount: failedLeads.length,
        csvName: uploadedFileName,
        leads: failedLeads
      };
      const updatedList = [...scheduleHistoryList, historyEntry];
      localStorage.setItem("pnx_reactivation_schedules", JSON.stringify(updatedList));
      setScheduleHistoryList(updatedList);

      setAlertData({
        title: "Reactivation Scheduled",
        description: `Successfully scheduled ${failedLeads.length} failed call(s) for ${new Date(scheduledAt).toLocaleString()}.`
      });
      
      setRescheduleOpen(false);
      clearFailedCalls();
      setPersistentFailedLeads([]); // clear it out since it is now scheduled
      setPersistentFailedLeadsInfo({});
      localStorage.removeItem("pnx_persistent_failed_leads");
      localStorage.removeItem("pnx_persistent_failed_leads_info");
      
      // Clear inputs to prevent accidental past scheduling next time
      setRescheduleDate("");
      setRescheduleTime("");
    } catch (e: any) {
      setAlertData({ title: "Error", description: e.message, isError: true });
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleEditSchedule = (idx: number) => {
    // Pre-fill form with existing schedule if available
    const targetSchedule = scheduleHistoryList[idx];
    if (targetSchedule?.scheduledAt) {
      const d = new Date(targetSchedule.scheduledAt);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const hh = String(d.getHours()).padStart(2, "0");
      const mi = String(d.getMinutes()).padStart(2, "0");
      setRescheduleDate(`${yyyy}-${mm}-${dd}`);
      setRescheduleTime(`${hh}:${mi}`);
      if (targetSchedule.did) setRescheduleDid(targetSchedule.did);
      
      // Remove it from the list so they can reschedule it fresh
      handleDeleteSchedule(idx);
    } else {
      setRescheduleDate("");
      setRescheduleTime("");
    }
    setRescheduleOpen(true);
  };

  const handleDeleteSchedule = (idx: number) => {
    const updated = scheduleHistoryList.filter((_, i) => i !== idx);
    setScheduleHistoryList(updated);
    if (updated.length > 0) {
      localStorage.setItem("pnx_reactivation_schedules", JSON.stringify(updated));
    } else {
      localStorage.removeItem("pnx_reactivation_schedules");
    }
  };

  const handleViewTranscript = (call: CallRecord) => {
    setSelectedCall(call);
    setTranscriptOpen(true);
  };

  return (
    <div className="space-y-6">
      {animationState && (
        <CompletionAnimation 
          title={animationState.title} 
          subtitle={animationState.subtitle} 
          type={animationState.type ?? "campaign"}
          onComplete={handleAnimationComplete} 
        />
      )}
      
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
            {loading
              ? "Loading outgoing calls…"
              : error
                ? "Could not load calls from server"
                : totalCalls > 0
                  ? `${totalCalls} outgoing call${totalCalls === 1 ? "" : "s"} found`
                  : "Manage campaigns and monitor outgoing AI voice calls"}
          </p>
        </div>
      </motion.div>

      <div className="space-y-4">
        {isInitializing || isLoading ? (
          <div className="space-y-4">
            <div className="h-32 w-full animate-pulse rounded-xl bg-muted" />
            <div className="h-32 w-full animate-pulse rounded-xl bg-muted" />
          </div>
        ) : (
          <>
            {outboundCampaign.isReactivation ? (
              <>
                <motion.div
                  initial={{ opacity: 0, y: -20, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, height: 'auto', scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  <CampaignCard
                    campaign={{ ...outboundCampaign, name: "Lead Reactivation" }}
                    progressPercent={hasOutboundNumber ? progressPercent : 0}
                    hasOutboundNumber={hasOutboundNumber}
                    onUploadClick={() => {}}
                    onStart={startCampaign}
                    onPause={pauseCampaign}
                    onResume={resumeCampaign}
                    onClear={clearCampaign}
                    onEditLead={editLead}
                    onDeleteLead={deleteLead}
                    onSchedule={() => {
                      setRescheduleDate("");
                      setRescheduleTime("");
                      setRescheduleOpen(true);
                    }}
                    onEditSchedule={scheduleHistoryList.length > 0 ? handleEditSchedule : undefined}
                    onDeleteSchedule={scheduleHistoryList.length > 0 ? handleDeleteSchedule : undefined}
                    displaySchedules={scheduleHistoryList}
                    failedCallsCount={outboundCampaign.failedCalls}
                  />
                </motion.div>
                <CampaignCard
                  campaign={{ id: "main-idle", name: "Outbound", status: "idle", leads: [], failedCalls: 0, completedCalls: 0, successfulCalls: 0, totalContacts: 0, isReactivation: false }}
                  progressPercent={0}
                  hasOutboundNumber={hasOutboundNumber}
                  onUploadClick={() => setUploadOpen(true)}
                  onStart={() => {}}
                  onPause={() => {}}
                  onResume={() => {}}
                  onClear={() => {}}
                  onEditLead={() => {}}
                  onDeleteLead={() => {}}
                  onSchedule={() => {}}
                  failedCallsCount={0}
                />
              </>
            ) : (
              <>
                  <motion.div
                    initial={{ opacity: 0, y: -20, height: 0, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, height: 'auto', scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="overflow-hidden mb-4"
                  >
                    <CampaignCard
                      campaign={{ 
                        ...leadReactivationCampaign, 
                        leads: persistentFailedLeads.length > 0 ? persistentFailedLeads : (scheduleHistoryList[0]?.leads || []), 
                        failedCalls: persistentFailedLeads.length || (scheduleHistoryList[0]?.leadsCount || 0) 
                      }}
                      progressPercent={0}
                      hasOutboundNumber={hasOutboundNumber}
                      onUploadClick={() => {}}
                      onStart={() => {}}
                      onPause={() => {}}
                      onResume={() => {}}
                      onClear={() => {
                         setPersistentFailedLeads([]);
                         setPersistentFailedLeadsInfo({});
                         localStorage.removeItem("pnx_persistent_failed_leads");
                         localStorage.removeItem("pnx_persistent_failed_leads_info");
                      }}
                      onEditLead={() => {}}
                      onDeleteLead={() => {}}
                      onSchedule={() => {
                        if (persistentFailedLeads.length === 0) return;
                        setRescheduleDate("");
                        setRescheduleTime("");
                        setRescheduleOpen(true);
                      }}
                      onEditSchedule={scheduleHistoryList.length > 0 ? handleEditSchedule : undefined}
                      onDeleteSchedule={scheduleHistoryList.length > 0 ? handleDeleteSchedule : undefined}
                      displaySchedules={scheduleHistoryList}
                      failedCallsCount={persistentFailedLeads.length || (scheduleHistoryList[0]?.leadsCount || 0)}
                      disableSchedule={persistentFailedLeads.length === 0}
                      scheduleDisabledReason="No unscheduled failed calls available."
                    />
                  </motion.div>

                <CampaignCard
                  campaign={hasOutboundNumber ? outboundCampaign : { ...outboundCampaign, status: "idle", leads: [], failedCalls: 0, completedCalls: 0 }}
                  progressPercent={hasOutboundNumber ? progressPercent : 0}
                  hasOutboundNumber={hasOutboundNumber}
                  onUploadClick={() => setUploadOpen(true)}
                  onStart={startCampaign}
                  onPause={pauseCampaign}
                  onResume={resumeCampaign}
                  onClear={clearCampaign}
                  onForceStop={forceStopCampaign}
                  onEditLead={editLead}
                  onDeleteLead={deleteLead}
                  onSchedule={() => {
                    const fallbackLeads = outboundCampaign.leads?.filter((l: any) => l.isFailed) || [];
                    if (persistentFailedLeads.length === 0 && fallbackLeads.length === 0) return;
                    setRescheduleDate("");
                    setRescheduleTime("");
                    setRescheduleOpen(true);
                  }}
                  failedCallsCount={outboundCampaign.failedCalls}
                />
              </>
            )}
          </>
        )}
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
          {loading && calls.length === 0 ? (
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
        didNumbers={user?.assignedNumbersDetailed}
      />

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
              {(() => {
                const fallbackLeads = outboundCampaign.leads?.filter((l: any) => l.isFailed) || [];
                const leadsToUse = persistentFailedLeads.length > 0 ? persistentFailedLeads : fallbackLeads;
                return `${leadsToUse.length} call${leadsToUse.length !== 1 ? "s" : ""} failed during the campaign. Select a date and time to automatically retry them.`;
              })()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* DID Number selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Outbound Number (DID)</label>
              <select
                value={rescheduleDid}
                onChange={(e) => setRescheduleDid(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
              >
                <option value="">— Default: {persistentFailedLeadsInfo?.selectedDid || outboundCampaign.selectedDid || "Auto-select"} —</option>
                {(user?.assignedNumbersDetailed || [])
                  .filter((n: any) => !n.direction || n.direction === "OUTBOUND" || n.direction === "BOTH")
                  .map((n: any) => (
                    <option key={n.id || n.number} value={n.number}>
                      {n.number}
                    </option>
                  ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Failed Leads ({persistentFailedLeads.length > 0 ? persistentFailedLeads.length : (outboundCampaign.leads?.filter((l: any) => l.isFailed) || []).length})
              </label>
              <div className="max-h-40 overflow-y-auto rounded-md border border-border bg-muted/30 p-2 text-sm">
                {(persistentFailedLeads.length > 0 ? persistentFailedLeads : (outboundCampaign.leads?.filter((l: any) => l.isFailed) || [])).map((lead: any, i: number) => (
                  <div key={i} className="flex justify-between border-b border-border/50 py-1 last:border-0">
                    <span>{lead.name}</span>
                    <span className="font-mono text-muted-foreground">{lead.phone}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Date
                  {rescheduleDate && (
                    <span className="text-muted-foreground font-normal ml-1">
                      ({new Date(rescheduleDate + "T12:00:00").toLocaleDateString(undefined, { weekday: "long" })})
                    </span>
                  )}
                </label>
                <input 
                  type="date" 
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className={`flex h-10 w-full rounded-md border ${dateError ? 'border-red-500 bg-red-500/10 text-red-600' : 'border-input bg-background'} px-3 py-2 text-sm`} 
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Time</label>
                <input 
                  type="time" 
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className={`flex h-10 w-full rounded-md border ${dateError ? 'border-red-500 bg-red-500/10 text-red-600' : 'border-input bg-background'} px-3 py-2 text-sm`} 
                />
              </div>
            </div>
            {dateError && (
              <p className="text-xs font-medium text-red-500 animate-in fade-in slide-in-from-top-1">
                {dateError}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleOpen(false)}>Cancel</Button>
            <Button onClick={handleReschedule} disabled={isRescheduling || !rescheduleDate || !rescheduleTime || !rescheduleDid || !!dateError}>
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
            <DialogDescription className="break-words whitespace-pre-wrap">
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
    </div>
  );
}
