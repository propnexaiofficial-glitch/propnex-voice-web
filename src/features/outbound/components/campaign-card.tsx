"use client";

import {
  CheckCircle2,
  Clock,
  Pause,
  PhoneOutgoing,
  Play,
  Sparkles,
  Upload,
  Users,
  Info,
  Pencil,
  Check,
  X,
  Trash2,
  CalendarClock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  StopCircle,
  ListChecks,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { isValidPhoneNumber } from "react-phone-number-input";
import type { Campaign } from "@/features/outbound/types";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  Campaign["status"],
  { label: string; color: string; bgColor: string }
> = {
  idle: { label: "No Campaign", color: "text-muted-foreground", bgColor: "bg-muted" },
  scheduled: { label: "Scheduled", color: "text-amber-500", bgColor: "bg-amber-500/10" },
  ready: { label: "Ready to Start", color: "text-amber-500", bgColor: "bg-amber-500/10" },
  running: { label: "Running", color: "text-primary", bgColor: "bg-primary/10" },
  paused: { label: "Paused", color: "text-amber-500", bgColor: "bg-amber-500/10" },
  completed: { label: "Completed", color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
  force_stopped: { label: "Force Stopped", color: "text-destructive", bgColor: "bg-destructive/10" },
};

type CampaignCardProps = {
  campaign: Campaign;
  progressPercent: number;
  onUploadClick: () => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onClear?: () => void;
  onForceStop?: () => void;
  onEditLead?: (index: number, newLead: any) => void;
  onDeleteLead?: (index: number) => void;
  onSchedule?: () => void;
  onEditSchedule?: (idx: number) => void;
  onDeleteSchedule?: (idx: number) => void;
  displaySchedules?: any[];
  failedCallsCount?: number;
  disableSchedule?: boolean;
  scheduleDisabledReason?: string;
  hasOutboundNumber?: boolean;
  className?: string;
  companyId?: string;
};

function LeadRow({ lead, idx, onSave, onDelete, campaignStatus }: { lead: any; idx: number; onSave: (newLead: any) => void; onDelete?: () => void, campaignStatus?: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(lead.name);
  const [phone, setPhone] = useState(lead.phone);

  useEffect(() => {
    setName(lead.name);
    setPhone(lead.phone);
  }, [lead.name, lead.phone]);

  const formatIndianNumber = (numStr: string): string => {
    let cleaned = numStr.toString().replace(/\D/g, "");
    if (cleaned.length === 10) return `+91${cleaned}`;
    if (cleaned.length === 11 && cleaned.startsWith("0")) return `+91${cleaned.substring(1)}`;
    if (cleaned.length === 12 && cleaned.startsWith("91")) return `+${cleaned}`;
    return "";
  };

  const handleSave = () => {
    const formatted = formatIndianNumber(phone);
    if (formatted) {
      onSave({ ...lead, name, phone: formatted, isInvalid: false });
      setIsEditing(false);
    } else {
      onSave({ ...lead, name, phone, isInvalid: true });
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex gap-2 items-center bg-muted/50 p-2 rounded border border-border">
        <Input value={name} onChange={(e) => setName(e.target.value)} className="h-7 text-xs flex-1" placeholder="Name" />
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-7 text-xs flex-1" placeholder="Phone" />
        <Button size="icon" variant="ghost" className="h-6 w-6 text-green-500" onClick={handleSave}>
          <Check className="size-3" />
        </Button>
        <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500" onClick={() => setIsEditing(false)}>
          <X className="size-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex justify-between items-center text-xs border-b border-border pb-1 hover:bg-muted/30 p-1 -mx-1 px-1 rounded transition-colors group", !isValidPhoneNumber(lead.phone) && campaignStatus === "ready" && "bg-red-500/10 border-red-500/20")}>
      <div className="flex items-center gap-2 overflow-hidden">
        <span className={cn("truncate max-w-[120px]", lead.called && "line-through text-muted-foreground", !isValidPhoneNumber(lead.phone) && campaignStatus === "ready" && "text-red-400 font-medium")}>{lead.name}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={cn("font-mono", lead.called && "line-through text-muted-foreground", !isValidPhoneNumber(lead.phone) && campaignStatus === "ready" && "text-red-400 font-medium")}>{lead.phone}</span>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          <button onClick={() => setIsEditing(true)} className="text-muted-foreground hover:text-foreground">
            <Pencil className="size-3" />
          </button>
          {onDelete && (
            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }} className="text-muted-foreground hover:text-red-500">
              <Trash2 className="size-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function CampaignCard({
  campaign,
  progressPercent,
  onUploadClick,
  onStart,
  onPause,
  onResume,
  onClear,
  onForceStop,
  onEditLead,
  onDeleteLead,
  onSchedule,
  onEditSchedule,
  onDeleteSchedule,
  displaySchedules,
  failedCallsCount = 0,
  disableSchedule,
  scheduleDisabledReason,
  hasOutboundNumber = true,
  className,
  companyId,
}: CampaignCardProps) {
  const status = statusConfig[campaign.status];
  const isComingSoon = campaign.comingSoon === true;
  const processedCount = campaign.completedCalls !== undefined 
    ? campaign.completedCalls 
    : (campaign.leads || []).filter((l: any) => l.called).length;

  const [reminding, setReminding] = useState(false);
  const [remindMessage, setRemindMessage] = useState<{text: string, type: string} | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [activeTab, setActiveTab] = useState<"pending" | "successful" | "failed">("pending");
  const [expandedScheduleIdx, setExpandedScheduleIdx] = useState<number | null>(null);
  const [leadsModalOpen, setLeadsModalOpen] = useState(false);

  const pendingLeads = (campaign.leads || []).map((l: any, i: number) => ({ ...l, originalIdx: i })).filter((l: any) => !l.called);
  const successLeads = (campaign.leads || []).map((l: any, i: number) => ({ ...l, originalIdx: i })).filter((l: any) => l.called && !l.isFailed);
  const failedLeads = (campaign.leads || []).map((l: any, i: number) => ({ ...l, originalIdx: i })).filter((l: any) => l.called && l.isFailed);
  const invalidLeads = (campaign.leads || []).map((l: any, i: number) => ({ ...l, originalIdx: i })).filter((l: any) => !isValidPhoneNumber(l.phone));



  const pendingSchedules = (displaySchedules || []).filter((s: any) => new Date(s.scheduledAt).getTime() > Date.now());
  const isPendingSchedule = pendingSchedules.length > 0;

  const isReactivationCard = campaign.id === "camp-001" || campaign.isReactivation || campaign.name?.includes("Lead Reactivation");

  useEffect(() => {
    if (isReactivationCard) return;

    const key = companyId ? `last_outbound_number_request_${companyId}` : "last_outbound_number_request";
    
    if (hasOutboundNumber) {
      return;
    }

    const lastRequest = localStorage.getItem(key);
    if (lastRequest) {
      const hoursSince = (Date.now() - parseInt(lastRequest)) / (1000 * 60 * 60);
      if (hoursSince < 24) {
        setIsLocked(true);
        setRemindMessage({ text: "You can only request once every 24 hours.", type: "error" });
      } else {
        localStorage.removeItem(key);
      }
    }
  }, [companyId, hasOutboundNumber]);

  const handleRemindAdmin = async () => {
    try {
      setReminding(true);
      setRemindMessage(null);
      const token = localStorage.getItem("accessToken") || localStorage.getItem("access_token");
      const storedUserStr = localStorage.getItem("user");
      const user = storedUserStr ? JSON.parse(storedUserStr) : {};
      const email = user.email || user.id || "default";
      const key = companyId ? `last_outbound_number_request_${companyId}` : "last_outbound_number_request";

      const adminBase = process.env.NEXT_PUBLIC_ADMIN_URL || "https://admin.propnexai.com";
      const res = await fetch(`${adminBase}/api/number-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          companyId: companyId || user.companyId || null,
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown",
          type: "OUTBOUND"
        })
      });

      if (res.ok) {
        setRemindMessage({ text: "Reminder sent successfully! Admin notified.", type: "success" });
        localStorage.setItem(key, Date.now().toString());
        setIsLocked(true);
      } else if (res.status === 429) {
        setRemindMessage({ text: "You can only request once every 24 hours.", type: "error" });
        localStorage.setItem(key, Date.now().toString());
        setIsLocked(true);
      } else {
        setRemindMessage({ text: "Failed to send reminder. Please try again.", type: "error" });
      }
    } catch (e) {
      setRemindMessage({ text: "Error sending reminder.", type: "error" });
    }
    setReminding(false);
  };

  if (isComingSoon) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "glass-card relative overflow-hidden rounded-lg border border-dashed border-border p-6",
          className
        )}
      >
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                <PhoneOutgoing className="size-5 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">{campaign.name}</h3>
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="size-3" />
                Coming Soon
              </Badge>
            </div>

            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              Failed outbound calls will be automatically moved here for you to reschedule and reactivate later.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("glass-card rounded-2xl p-6", className)}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
              <PhoneOutgoing className="size-5 text-foreground" />
            </div>
            <h3 className="text-lg font-semibold">{campaign.name}</h3>
            <Badge variant="secondary">
              {isPendingSchedule && (campaign.status === "idle" || campaign.status === "scheduled")
                ? `${pendingSchedules.length} Scheduled` 
                : campaign.status !== "idle" && (pendingSchedules[0]?.csvName || campaign.uploadedFileName) && !campaign.isReactivation && campaign.id !== "camp-001" && !campaign.name?.includes("Lead Reactivation")
                  ? `${status.label} • ${campaign.uploadedFileName || pendingSchedules[0]?.csvName}`
                  : status.label}
            </Badge>
            {isReactivationCard && campaign.qStage && (
               <div className="flex gap-2 ml-2">
                 <Badge variant={campaign.qStage === "Q1" ? "default" : "outline"} className={cn("text-xs font-semibold px-2 py-0.5", campaign.qStage === "Q1" && campaign.qStatus === "Running" && "animate-pulse")}>Q1: {campaign.qStage === "Q1" ? campaign.qStatus : (campaign.qStage === "Q2" || campaign.qStage === "Q3" ? "Completed" : "Scheduled")}</Badge>
                 <Badge variant={campaign.qStage === "Q2" ? "default" : "outline"} className={cn("text-xs font-semibold px-2 py-0.5", campaign.qStage === "Q2" && campaign.qStatus === "Running" && "animate-pulse")}>Q2: {campaign.qStage === "Q2" ? campaign.qStatus : (campaign.qStage === "Q3" ? "Completed" : "Pending")}</Badge>
                 <Badge variant={campaign.qStage === "Q3" ? "default" : "outline"} className={cn("text-xs font-semibold px-2 py-0.5", campaign.qStage === "Q3" && campaign.qStatus === "Running" && "animate-pulse")}>Q3: {campaign.qStage === "Q3" ? campaign.qStatus : "Pending"}</Badge>
               </div>
            )}
            
            {((campaign.status !== "idle" || isReactivationCard) && campaign.leads && campaign.leads.length > 0) && (
              <div className="flex items-center gap-2 ml-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <div className={cn("flex size-7 cursor-pointer items-center justify-center rounded-full transition-colors", isReactivationCard ? "bg-primary/20 hover:bg-primary/30 shadow-[0_0_10px_rgba(var(--primary),0.3)] border border-primary/30" : "bg-muted/50 hover:bg-muted")} title="View/Edit Leads">
                      <Info className={cn("size-4", isReactivationCard ? "text-primary" : "text-muted-foreground")} />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className={cn("w-[350px] max-h-96 overflow-y-auto p-4 space-y-4 z-50", isReactivationCard && "backdrop-blur-md bg-background/90 border-primary/30 shadow-2xl")}>
                    
                    {(campaign.status === "ready" || campaign.status === "scheduled") && (
                      <div className="space-y-2">
                        <p className="font-semibold">Pending ({(campaign.leads || []).length} Leads)</p>
                        {(campaign.leads || [])
                          .map((l: any, i: number) => ({ ...l, originalIdx: i }))
                          .sort((a: any, b: any) => {
                            const aValid = isValidPhoneNumber(a.phone);
                            const bValid = isValidPhoneNumber(b.phone);
                            if (!aValid && bValid) return -1;
                            if (aValid && !bValid) return 1;
                            return 0;
                          })
                          .map((lead: any) => (
                            <LeadRow key={`${lead.phone}-${lead.originalIdx}`} lead={lead} idx={lead.originalIdx} onSave={(newLead) => onEditLead?.(lead.originalIdx, newLead)} onDelete={campaign.status === "ready" ? () => onDeleteLead?.(lead.originalIdx) : undefined} campaignStatus={campaign.status} />
                        ))}
                      </div>
                    )}

                    {campaign.status === "running" && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-1 border-b border-border pb-2">
                          <button onClick={() => setActiveTab("pending")} className={cn("px-3 py-1 text-xs font-medium rounded-full transition-colors", activeTab === "pending" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50")}>
                            Pending ({pendingLeads.length})
                          </button>
                          <button onClick={() => setActiveTab("successful")} className={cn("px-3 py-1 text-xs font-medium rounded-full transition-colors", activeTab === "successful" ? "bg-emerald-500/20 text-emerald-600" : "text-muted-foreground hover:bg-muted/50")}>
                            Success ({successLeads.length})
                          </button>
                          <button onClick={() => setActiveTab("failed")} className={cn("px-3 py-1 text-xs font-medium rounded-full transition-colors", activeTab === "failed" ? "bg-rose-500/20 text-rose-600" : "text-muted-foreground hover:bg-muted/50")}>
                            Failed ({failedLeads.length})
                          </button>
                        </div>
                        
                        {activeTab === "pending" && pendingLeads.length > 0 && (
                          <div className="space-y-2">
                            {pendingLeads.map((lead: any) => (
                              <LeadRow key={`${lead.phone}-${lead.originalIdx}`} lead={lead} idx={lead.originalIdx} onSave={() => {}} campaignStatus={campaign.status} />
                            ))}
                          </div>
                        )}
                        {activeTab === "pending" && pendingLeads.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No pending leads</p>}

                        {activeTab === "successful" && successLeads.length > 0 && (
                          <div className="space-y-2">
                            {successLeads.map((lead: any) => (
                              <LeadRow key={`${lead.phone}-${lead.originalIdx}`} lead={lead} idx={lead.originalIdx} onSave={() => {}} campaignStatus={campaign.status} />
                            ))}
                          </div>
                        )}
                        {activeTab === "successful" && successLeads.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No successful calls yet</p>}

                        {activeTab === "failed" && failedLeads.length > 0 && (
                          <div className="space-y-2">
                            {failedLeads.map((lead: any) => (
                              <LeadRow key={`${lead.phone}-${lead.originalIdx}`} lead={lead} idx={lead.originalIdx} onSave={() => {}} campaignStatus={campaign.status} />
                            ))}
                          </div>
                        )}
                        {activeTab === "failed" && failedLeads.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No failed calls yet</p>}
                      </div>
                    )}

                  </PopoverContent>
                </Popover>
                
                {campaign.status === "ready" && (campaign.leads || []).some((l: any) => !isValidPhoneNumber(l.phone)) && (
                  <span className="text-xs font-medium text-red-500 bg-red-500/10 px-2 py-1 rounded-md flex items-center animate-in fade-in zoom-in-95 duration-200">
                    &larr; Please correct invalid numbers before starting
                  </span>
                )}
              </div>
            )}
          </div>

          {campaign.uploadedFileName && !campaign.isReactivation && campaign.id !== "camp-001" && !campaign.name?.includes("Lead Reactivation") && (
            <p className="text-sm text-muted-foreground">
              File: <span className="text-foreground">{campaign.uploadedFileName}</span>
              {" · "}
              <span className="text-foreground">{campaign.totalContacts}</span> contacts
            </p>
          )}

          {campaign.status === "ready" && invalidLeads.length > 0 && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg max-h-40 overflow-y-auto">
              <p className="text-sm font-semibold text-red-500 mb-2 flex items-center gap-2">
                <AlertCircle className="size-4" />
                Found {invalidLeads.length} invalid number(s). Please correct them before starting:
              </p>
              <div className="space-y-1">
                {invalidLeads.map((lead: any) => (
                  <LeadRow key={`invalid-${lead.originalIdx}`} lead={lead} idx={lead.originalIdx} onSave={(newLead) => onEditLead?.(lead.originalIdx, newLead)} onDelete={() => onDeleteLead?.(lead.originalIdx)} campaignStatus={campaign.status} />
                ))}
              </div>
            </div>
          )}

          {(campaign.status === "idle" || campaign.status === "completed" || isReactivationCard) && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {isReactivationCard && campaign.qStage
                  ? `Auto-reactivation ${campaign.qStage} • ${campaign.leads?.length || 0} lead${(campaign.leads?.length || 0) !== 1 ? 's' : ''} scheduled for retry`
                  : isReactivationCard
                    ? "Automatically re-engage failed leads across 3 follow-up waves."
                    : !hasOutboundNumber 
                      ? "Please request an outbound number from the admin to launch campaigns." 
                      : "Upload a CSV contact list to prepare your next outbound campaign."}
              </p>
              {/* Q1/Q2/Q3 process overview — shown on idle reactivation card */}
              {isReactivationCard && !campaign.qStage && (
                <div className="flex items-center gap-2 mt-1">
                  {[
                    { stage: "Q1", label: "1st retry", color: "text-emerald-500 border-emerald-500/40 bg-emerald-500/10" },
                    { stage: "Q2", label: "2nd retry", color: "text-amber-500 border-amber-500/40 bg-amber-500/10" },
                    { stage: "Q3", label: "Final retry", color: "text-primary border-primary/40 bg-primary/10" },
                  ].map(({ stage, label, color }, i) => (
                    <div key={stage} className="flex items-center gap-2">
                      <div className={`flex flex-col items-center px-2.5 py-1 rounded-md border text-xs font-semibold ${color}`}>
                        <span>{stage}</span>
                        <span className="text-[10px] font-normal opacity-70">{label}</span>
                      </div>
                      {i < 2 && <span className="text-muted-foreground text-xs">→</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}


          {/* Schedule badges — unified for local history and backend scheduled state */}
          {(() => {
            if (!displaySchedules || displaySchedules.length === 0) return null;

            return (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-2 mt-2"
              >
                {displaySchedules.map((schedule: any, idx: number) => {
                  const isPending = new Date(schedule.scheduledAt).getTime() > Date.now();
                  const isExpanded = expandedScheduleIdx === idx;
                  
                  return (
                    <div 
                      key={idx} 
                      onClick={() => setExpandedScheduleIdx(isExpanded ? null : idx)}
                      className="flex flex-col gap-2 bg-muted/30 hover:bg-muted/50 border border-border rounded-lg px-3 py-2 text-xs w-full max-w-lg cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <CalendarClock className="size-4 text-primary" />
                          <span className="font-medium">
                            {isPending ? (
                              <span className="text-amber-500">Pending</span>
                            ) : (campaign.status === "running" && idx === 0) ? (
                              <span className="text-emerald-500">Running {processedCount} / {campaign.totalContacts}</span>
                            ) : (campaign.status === "paused" && idx === 0) ? (
                              <span className="text-amber-500">Paused {processedCount} / {campaign.totalContacts}</span>
                            ) : (
                              <span className="text-emerald-500">Completed</span>
                            )}
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground">
                            {new Date(schedule.scheduledAt).toLocaleString(undefined, { weekday: "long", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <div className="text-muted-foreground flex items-center">
                          {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                        </div>
                      </div>
                      
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 mt-1 border-t border-border/50">
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground pl-6">
                                  <span className="flex items-center gap-1">
                                    File Name <span className="font-medium text-foreground truncate max-w-[120px]" title={schedule.csvName}>{schedule.csvName || "Campaign Schedule"}</span>,
                                  </span>
                                  
                                  {schedule.did && (
                                    <span className="flex items-center gap-1">
                                      DID Num -
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <span className="font-mono text-foreground cursor-help hover:text-primary transition-colors border-b border-dashed border-muted-foreground/50 pb-0.5">
                                              ...{schedule.did.replace(/\D/g, '').slice(-3)}
                                            </span>
                                          </TooltipTrigger>
                                          <TooltipContent className="text-xs space-y-1">
                                            <p><span className="text-muted-foreground">Full Number:</span> {schedule.did}</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>,
                                    </span>
                                  )}
                                  
                                  <span className="flex items-center gap-1">
                                    Channel - <span className="font-medium text-foreground">{schedule.channels || 1}</span>,
                                  </span>
                                  
                                  {/* Failed calls with Info Popover */}
                                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                    <span>Leads <span className="font-medium text-foreground">{schedule.leadsCount || (schedule.leads?.length || 0)}</span></span>
                                  {(schedule.leads && schedule.leads.length > 0) || (campaign.status === "running" && idx === 0 && (campaign.leads?.length ?? 0) > 0) ? (
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <div className={cn("flex size-5 cursor-pointer items-center justify-center rounded-full transition-colors", (campaign.status === "running" && idx === 0) ? "bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.8)]" : "bg-muted hover:bg-muted-foreground/20")} title="View Leads">
                                          <Info className={cn("size-3", (campaign.status === "running" && idx === 0) ? "text-primary-foreground" : "text-foreground")} />
                                        </div>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-[350px] max-h-96 overflow-y-auto p-3 space-y-4 z-50">
                                        {campaign.status === "running" && idx === 0 ? (
                                          <div className="space-y-4">
                                            <div className="flex items-center gap-1 border-b border-border pb-2">
                                              <button onClick={() => setActiveTab("pending")} className={cn("px-3 py-1 text-xs font-medium rounded-full transition-colors", activeTab === "pending" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50")}>
                                                Pending ({pendingLeads.length})
                                              </button>
                                              <button onClick={() => setActiveTab("successful")} className={cn("px-3 py-1 text-xs font-medium rounded-full transition-colors", activeTab === "successful" ? "bg-emerald-500/20 text-emerald-600" : "text-muted-foreground hover:bg-muted/50")}>
                                                Success ({successLeads.length})
                                              </button>
                                              <button onClick={() => setActiveTab("failed")} className={cn("px-3 py-1 text-xs font-medium rounded-full transition-colors", activeTab === "failed" ? "bg-rose-500/20 text-rose-600" : "text-muted-foreground hover:bg-muted/50")}>
                                                Failed ({failedLeads.length})
                                              </button>
                                            </div>
                                            
                                            {activeTab === "pending" && pendingLeads.length > 0 && (
                                              <div className="space-y-2">
                                                {pendingLeads.map((lead: any) => (
                                                  <LeadRow key={`${lead.phone}-${lead.originalIdx}`} lead={lead} idx={lead.originalIdx} onSave={() => {}} campaignStatus={campaign.status} />
                                                ))}
                                              </div>
                                            )}
                                            {activeTab === "pending" && pendingLeads.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No pending leads</p>}
                                            {activeTab === "successful" && successLeads.length > 0 && (
                                              <div className="space-y-2">
                                                {successLeads.map((lead: any) => (
                                                  <LeadRow key={`${lead.phone}-${lead.originalIdx}`} lead={lead} idx={lead.originalIdx} onSave={() => {}} campaignStatus={campaign.status} />
                                                ))}
                                              </div>
                                            )}
                                            {activeTab === "successful" && successLeads.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No successful calls yet</p>}
                                            {activeTab === "failed" && failedLeads.length > 0 && (
                                              <div className="space-y-2">
                                                {failedLeads.map((lead: any) => (
                                                  <LeadRow key={`${lead.phone}-${lead.originalIdx}`} lead={lead} idx={lead.originalIdx} onSave={() => {}} campaignStatus={campaign.status} />
                                                ))}
                                              </div>
                                            )}
                                            {activeTab === "failed" && failedLeads.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No failed calls yet</p>}
                                          </div>
                                        ) : (
                                          <>
                                            <p className="font-semibold text-sm">Leads</p>
                                            <div className="space-y-1">
                                              {schedule.leads?.map((lead: any, iIdx: number) => (
                                                <div key={iIdx} className="flex justify-between items-center text-xs border-b border-border pb-1 hover:bg-muted/30 p-1 -mx-1 px-1 rounded">
                                                  <span className="truncate max-w-[120px]">{lead.name}</span>
                                                  <span className="font-mono">{lead.phone}</span>
                                                </div>
                                              ))}
                                            </div>
                                          </>
                                        )}
                                      </PopoverContent>
                                    </Popover>
                                  ) : null}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-1 self-end sm:self-auto" onClick={(e) => e.stopPropagation()}>
                                {(onEditSchedule || onSchedule) && isPending && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="size-7 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                                          onClick={() => {
                                            if (onEditSchedule) onEditSchedule(idx);
                                            else if (onSchedule) onSchedule();
                                          }}
                                        >
                                          <Pencil className="size-3.5" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent><p>Edit schedule time</p></TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                                {onDeleteSchedule && !isPending && !(campaign.status === "running" && idx === 0) && (!isReactivationCard || (campaign.qStage === "Q3" && campaign.qStatus === "Completed")) && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="size-7 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500"
                                          onClick={() => onDeleteSchedule(idx)}
                                        >
                                          <Trash2 className="size-3.5" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent><p>Remove from history</p></TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </motion.div>
            );
          })()}
        </div>

        <div className="flex flex-col gap-2 items-end">
          <div className="flex flex-wrap gap-2 items-center">
            {!hasOutboundNumber && !isReactivationCard ? (
              <Button onClick={handleRemindAdmin} disabled={reminding || isLocked} className="gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white">
                <PhoneOutgoing className="size-4" />
                {reminding ? "Sending..." : (isLocked ? "Request Sent" : "Request Outbound Number")}
              </Button>
            ) : (campaign.status === "idle" || campaign.status === "completed") && !isReactivationCard ? (
              <Button variant="outline" className="gap-2" onClick={onUploadClick}>
                <Upload className="size-4" />
                Upload CSV
              </Button>
            ) : null}

          {campaign.status === "ready" && (
            <div className="flex flex-col gap-2 items-end">
              <div className="flex gap-2">
                {(!isReactivationCard || (campaign.qStage === "Q3" && campaign.qStatus === "Completed")) && (
                  <Button variant="outline" className="gap-2 text-destructive border-destructive/20 hover:bg-destructive/10" onClick={onClear}>
                    <Trash2 className="size-4" />
                    Clear File
                  </Button>
                )}
                <Button className="gap-2" onClick={onStart} disabled={(campaign.leads || []).some((l: any) => !isValidPhoneNumber(l.phone))}>
                  <Play className="size-4" />
                  Start Campaign
                </Button>
              </div>
            </div>
          )}

          {campaign.status === "running" && !isReactivationCard && (
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2 text-destructive border-destructive/20 hover:bg-destructive/10" onClick={onForceStop}>
                <StopCircle className="size-4" />
                Force Stop
              </Button>
              <Button variant="secondary" className="gap-2 relative overflow-hidden group min-w-40" onClick={onPause}>
                <div className="absolute inset-0 bg-primary/10 w-full rounded-md z-0" />
                <motion.div 
                  className="absolute inset-0 bg-primary/20 rounded-md z-0" 
                  style={{ width: `${progressPercent}%` }} 
                  layout 
                />
                <span className="relative z-10 flex items-center gap-2">
                  <Pause className="size-4 hidden group-hover:block" />
                  <span className="group-hover:hidden">Processing {processedCount} / {campaign.totalContacts}</span>
                  <span className="hidden group-hover:block">Pause</span>
                </span>
              </Button>
            </div>
          )}

          {campaign.status === "paused" && !isReactivationCard && (
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2 text-destructive border-destructive/20 hover:bg-destructive/10" onClick={onForceStop}>
                <StopCircle className="size-4" />
                Force Stop
              </Button>
              <Button className="gap-2 relative overflow-hidden group min-w-40" onClick={onResume}>
                <div className="absolute inset-0 bg-primary/10 w-full rounded-md z-0" />
                <motion.div 
                  className="absolute inset-0 bg-primary/20 rounded-md z-0" 
                  style={{ width: `${progressPercent}%` }} 
                  layout 
                />
                <span className="relative z-10 flex items-center gap-2">
                  <Play className="size-4 hidden group-hover:block" />
                  <span className="group-hover:hidden">Paused {processedCount} / {campaign.totalContacts}</span>
                  <span className="hidden group-hover:block">Resume</span>
                </span>
              </Button>
            </div>
          )}

          {isReactivationCard && campaign.qStage && (
            <Button
              variant="outline"
              className="border-primary/50 text-primary hover:bg-primary/10 gap-2 h-9 text-sm"
              onClick={() => setLeadsModalOpen(true)}
            >
              <ListChecks className="size-4" />
              Lead Info ({campaign.leads?.length || 0})
            </Button>
          )}

          {isReactivationCard && !campaign.qStage && (campaign.status === "idle" || campaign.status === "completed" || campaign.status === "scheduled") && (
            <Button
              variant="outline"
              className="border-primary/50 text-primary hover:bg-primary/10 gap-2 h-9 text-sm"
              onClick={() => setLeadsModalOpen(true)}
            >
              <ListChecks className="size-4" />
              Lead Info{failedCallsCount > 0 ? ` (${failedCallsCount})` : ""}
            </Button>
          )}
          </div>
          {remindMessage && !isReactivationCard && (
            <p className={`text-xs ${remindMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {remindMessage.text}
            </p>
          )}
        </div>
      </div>

      {/* Lead Info Modal — shows leads for qStage campaigns, or process overview for idle */}
      <Dialog open={leadsModalOpen} onOpenChange={setLeadsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ListChecks className="size-5 text-primary" />
              {campaign.qStage
                ? `Lead Reactivation ${campaign.qStage} — Leads (${campaign.leads?.length || 0})`
                : "Lead Reactivation — Process Overview"}
            </DialogTitle>
          </DialogHeader>

          {!campaign.qStage ? (
            // Show process overview when no active qStage
            <div className="space-y-3 py-2">
              <p className="text-sm text-muted-foreground">Failed leads are automatically re-engaged in 3 sequential waves:</p>
              {[
                { stage: "Q1", label: "1st Follow-up", desc: "Initial retry — re-dials all failed leads from the original campaign.", color: "border-emerald-500/30 bg-emerald-500/5 text-emerald-500" },
                { stage: "Q2", label: "2nd Follow-up", desc: "Re-dials leads that still didn't answer after Q1.", color: "border-amber-500/30 bg-amber-500/5 text-amber-500" },
                { stage: "Q3", label: "Final Follow-up", desc: "Last attempt — re-dials any remaining unanswered leads after Q2.", color: "border-primary/30 bg-primary/5 text-primary" },
              ].map(({ stage, label, desc, color }) => (
                <div key={stage} className={`flex gap-3 p-3 rounded-lg border ${color}`}>
                  <span className={`font-bold text-sm mt-0.5 min-w-[28px] ${color.split(' ')[2]}`}>{stage}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
              {failedCallsCount > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-sm font-medium text-foreground mb-2">{failedCallsCount} lead{failedCallsCount !== 1 ? 's' : ''} available for reactivation</p>
                  <Button
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => { setLeadsModalOpen(false); onSchedule?.(); }}
                    disabled={!hasOutboundNumber}
                  >
                    <CalendarClock className="size-4" />
                    Schedule Reactivation
                  </Button>
                </div>
              )}
            </div>
          ) : (
            // Show leads list for active qStage
            <>
              <div className="max-h-80 overflow-y-auto space-y-1 pr-1">
                {(campaign.leads || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No leads available.</p>
                ) : (
                  (campaign.leads || []).map((lead: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-xs border-b border-border pb-1.5 last:border-0 py-1.5 hover:bg-muted/30 px-1 rounded">
                      <span className={cn("truncate max-w-[150px] font-medium", lead.isFailed && "text-red-400")}>{lead.name || "—"}</span>
                      <span className={cn("font-mono text-muted-foreground", lead.isFailed && "text-red-400")}>{lead.phone}</span>
                    </div>
                  ))
                )}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {campaign.scheduledAt
                  ? `Scheduled for ${new Date(campaign.scheduledAt).toLocaleString(undefined, { weekday: 'long', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
                  : `Status: ${campaign.status}`}
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>

    </motion.div>
  );
}
