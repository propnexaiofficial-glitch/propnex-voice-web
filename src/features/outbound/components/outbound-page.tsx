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
    clearFailedCalls,
    alertData,
    setAlertData,
  } = useCampaign();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);

  const { user, isLoading } = useUserContext();
  const hasOutboundNumber = isLoading ? true : (
    user?.role === "SYSTEM_ADMIN" || (user?.assignedNumbersDetailed && user.assignedNumbersDetailed.length > 0)
  );

  const [reactivationCampaigns, setReactivationCampaigns] = useState<any[]>([]);
  const [editCampaignId, setEditCampaignId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // FORCE CLEAR STUCK STATE FOR USER
      const saved = localStorage.getItem('reactivation_state_admin_v2');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setReactivationCampaigns(parsed);
        } catch (e) {}
      } else {
        const oldSaved = localStorage.getItem('reactivation_state_admin');
        if (oldSaved) {
          try {
            const parsed = JSON.parse(oldSaved);
            if (parsed) setReactivationCampaigns([parsed]);
          } catch (e) {}
        }
      }
    }
  }, []);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleDid, setRescheduleDid] = useState("");

  const shouldShowIdleReactivation = hasOutboundNumber && !outboundCampaign?.isReactivation && (
    (outboundCampaign?.failedCalls || 0) > 0
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setReactivationCampaigns(prev => {
        let hasChanges = false;
        const now = Date.now();
        const next = prev.map(camp => {
          if (camp.status === "scheduled" && camp.scheduledAt && now >= new Date(camp.scheduledAt).getTime()) {
            hasChanges = true;
            
            setTimeout(() => {
              import("react-hot-toast").then(mod => {
                mod.toast.success(`Lead Reactivation is now active! 🚀`, { duration: 4000 });
              });
              
              setTimeout(() => {
                import("react-hot-toast").then(mod => {
                  mod.toast.success(`Lead Reactivation history work completed ✅`, { duration: 5000 });
                });
                
                setReactivationCampaigns(current => {
                   const updated = current.filter(c => c.id !== camp.id);
                   localStorage.setItem('reactivation_state_admin_v2', JSON.stringify(updated));
                   return updated;
                });
              }, 4000);
            }, 0);
            
            return { ...camp, status: "running" };
          }
          return camp;
        });
        
        if (hasChanges) {
           localStorage.setItem('reactivation_state_admin_v2', JSON.stringify(next));
           return next;
        }
        return prev;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleReschedule = async () => {
    try {
      setIsRescheduling(true);
      const token = localStorage.getItem("accessToken") || localStorage.getItem("access_token");
      const editingCamp = editCampaignId ? reactivationCampaigns.find(c => c.id === editCampaignId) : null;
      const failedLeads = editingCamp 
        ? editingCamp.leads 
        : (outboundCampaign.leads?.filter((l: any) => l.isFailed) || []);
      
      const scheduledAt = new Date(`${rescheduleDate}T${rescheduleTime}`).toISOString();
      const didNumber = rescheduleDid || user?.assignedNumbersDetailed?.[0]?.number;
      const channels = user?.assignedNumbersDetailed?.[0]?.channels ?? 1;

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
          channels
        })
      });

      if (!res.ok) throw new Error("Failed to reschedule calls");

      const newState = {
        ...leadReactivationCampaign,
        id: editCampaignId || `react-${Date.now()}`,
        status: "scheduled",
        scheduledAt,
        totalContacts: failedLeads.length,
        leads: failedLeads.map((l: any) => ({ ...l, isFailed: false, called: false }))
      };
      setAlertData({
        title: "Reactivation Scheduled ✓",
        description: `Successfully scheduled ${failedLeads.length} failed call(s) for ${new Date(scheduledAt).toLocaleString()}.`
      });
      
      setReactivationCampaigns(prev => {
         let next;
         if (editCampaignId) {
            next = prev.map(c => c.id === editCampaignId ? { ...c, scheduledAt, leads: newState.leads, totalContacts: newState.totalContacts } : c);
         } else {
            next = [...prev, newState];
         }
         localStorage.setItem('reactivation_state_admin_v2', JSON.stringify(next));
         return next;
      });
      
      setRescheduleOpen(false);
      
      if (!editCampaignId) {
        clearFailedCalls();
      }
      setEditCampaignId(null);
      
      // Clear inputs to prevent accidental past scheduling next time
      setRescheduleDate("");
      setRescheduleTime("");
    } catch (e: any) {
      setAlertData({ title: "Error", description: e.message, isError: true });
    } finally {
      setIsRescheduling(false);
    }
  };

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
        <AnimatePresence>
          {reactivationCampaigns.map(camp => (
            <motion.div
              key={camp.id}
              initial={{ opacity: 0, y: -20, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, y: -20, height: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="overflow-hidden"
            >
              <CampaignCard
                campaign={camp}
                progressPercent={0}
                onUploadClick={() => {}}
                onStart={() => {}}
                onPause={() => {}}
                onResume={() => {}}
                onSchedule={() => {
                  setEditCampaignId(camp.id);
                  if (camp.scheduledAt) {
                    const d = new Date(camp.scheduledAt);
                    setRescheduleDate(d.toISOString().split("T")[0]);
                    setRescheduleTime(d.toTimeString().split(" ")[0].slice(0, 5));
                  }
                  setRescheduleOpen(true);
                }}
                onEditLead={(idx, newLead) => {
                  setReactivationCampaigns(prev => {
                    const next = prev.map(c => 
                      c.id === camp.id 
                        ? { ...c, leads: c.leads.map((l: any, i: number) => i === idx ? newLead : l) } 
                        : c
                    );
                    localStorage.setItem('reactivation_state_admin_v2', JSON.stringify(next));
                    return next;
                  });
                }}
                onDeleteLead={(idx) => {
                  setReactivationCampaigns(prev => {
                    const next = prev.map(c => 
                      c.id === camp.id 
                        ? { 
                            ...c, 
                            leads: c.leads.filter((_: any, i: number) => i !== idx),
                            totalContacts: Math.max(0, c.totalContacts - 1)
                          } 
                        : c
                    );
                    localStorage.setItem('reactivation_state_admin_v2', JSON.stringify(next));
                    return next;
                  });
                }}
                failedCallsCount={0}
                hasOutboundNumber={hasOutboundNumber}
              />
            </motion.div>
          ))}
          
          {shouldShowIdleReactivation && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, y: -20, height: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="overflow-hidden"
            >
              <CampaignCard
                campaign={{ ...leadReactivationCampaign, leads: outboundCampaign.leads?.filter((l: any) => l.isFailed) }}
                progressPercent={0}
                onUploadClick={() => {}}
                onStart={() => {}}
                onPause={() => {}}
                onResume={() => {}}
                onSchedule={() => {
                  setEditCampaignId(null);
                  setRescheduleDate("");
                  setRescheduleTime("");
                  setRescheduleOpen(true);
                }}
                failedCallsCount={outboundCampaign.failedCalls}
                hasOutboundNumber={hasOutboundNumber}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <CampaignCard
          campaign={hasOutboundNumber ? outboundCampaign : { ...outboundCampaign, status: "idle", leads: [], failedCalls: 0, completedCalls: 0 }}
          progressPercent={hasOutboundNumber ? progressPercent : 0}
          hasOutboundNumber={hasOutboundNumber}
          onUploadClick={() => setUploadOpen(true)}
          onStart={() => {
            startCampaign();
          }}
          onPause={pauseCampaign}
          onResume={resumeCampaign}
          onClear={clearCampaign}
          onEditLead={editLead}
          onDeleteLead={deleteLead}
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
              {editCampaignId 
                ? "Update the date and time for this scheduled Reactivation Campaign." 
                : `${outboundCampaign.failedCalls} call${outboundCampaign.failedCalls !== 1 ? "s" : ""} failed during the campaign. Select a date and time to automatically retry them.`}
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
                <option value="">— Select number —</option>
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
              <label className="text-sm font-medium">Failed Leads ({(editCampaignId ? reactivationCampaigns.find(c => c.id === editCampaignId)?.leads || [] : outboundCampaign.leads?.filter((l: any) => l.isFailed) || []).length})</label>
              <div className="max-h-40 overflow-y-auto rounded-md border border-border bg-muted/30 p-2 text-sm">
                {(editCampaignId ? reactivationCampaigns.find(c => c.id === editCampaignId)?.leads || [] : outboundCampaign.leads?.filter((l: any) => l.isFailed) || []).map((lead: any, i: number) => (
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
    </div>
  );
}
