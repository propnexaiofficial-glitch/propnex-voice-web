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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { isValidPhoneNumber } from "react-phone-number-input";
import type { Campaign } from "@/features/outbound/types";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  Campaign["status"],
  { label: string; variant: "default" | "secondary" | "success" | "warning" | "gold" }
> = {
  idle: { label: "No Campaign", variant: "secondary" },
  scheduled: { label: "Scheduled", variant: "gold" },
  ready: { label: "Ready to Start", variant: "gold" },
  running: { label: "Running", variant: "success" },
  paused: { label: "Paused", variant: "warning" },
  completed: { label: "Completed", variant: "default" },
};

type CampaignCardProps = {
  campaign: Campaign;
  progressPercent: number;
  onUploadClick: () => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onClear?: () => void;
  onEditLead?: (index: number, newLead: any) => void;
  onDeleteLead?: (index: number) => void;
  onSchedule?: () => void;
  onEditSchedule?: (idx: number) => void;
  onDeleteSchedule?: (idx: number) => void;
  displaySchedules?: any[];
  failedCallsCount?: number;
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
  onEditLead,
  onDeleteLead,
  onSchedule,
  onEditSchedule,
  onDeleteSchedule,
  displaySchedules,
  failedCallsCount = 0,
  hasOutboundNumber = true,
  className,
  companyId,
}: CampaignCardProps) {
  const status = statusConfig[campaign.status];
  const isComingSoon = campaign.comingSoon === true;
  const processedCount = (campaign.leads || []).filter((l: any) => l.called).length;

  const [reminding, setReminding] = useState(false);
  const [remindMessage, setRemindMessage] = useState<{text: string, type: string} | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [activeTab, setActiveTab] = useState<"pending" | "successful" | "failed">("pending");
  const [expandedScheduleIdx, setExpandedScheduleIdx] = useState<number | null>(null);

  const pendingLeads = (campaign.leads || []).map((l: any, i: number) => ({ ...l, originalIdx: i })).filter((l: any) => !l.called);
  const successLeads = (campaign.leads || []).map((l: any, i: number) => ({ ...l, originalIdx: i })).filter((l: any) => l.called && !l.isFailed);
  const failedLeads = (campaign.leads || []).map((l: any, i: number) => ({ ...l, originalIdx: i })).filter((l: any) => l.called && l.isFailed);
  const invalidLeads = (campaign.leads || []).map((l: any, i: number) => ({ ...l, originalIdx: i })).filter((l: any) => !isValidPhoneNumber(l.phone));



  const pendingSchedules = (displaySchedules || []).filter((s: any) => new Date(s.scheduledAt).getTime() > Date.now());
  const isPendingSchedule = pendingSchedules.length > 0;

  useEffect(() => {
    const key = companyId ? `last_outbound_number_request_${companyId}` : "last_outbound_number_request";
    
    if (hasOutboundNumber) {
      // If they already have a number, clear the lock and don't show the error
      localStorage.removeItem(key);
      setIsLocked(false);
      setRemindMessage(null);
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
            
            {(campaign.status !== "idle" && campaign.status !== "completed" && campaign.leads && campaign.leads.length > 0 && !campaign.isReactivation && campaign.name !== "Lead Reactivation") && (
              <div className="flex items-center gap-2 ml-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <div className="flex size-7 cursor-pointer items-center justify-center rounded-full bg-muted/50 hover:bg-muted transition-colors" title="View/Edit Leads">
                      <Info className="size-4 text-muted-foreground" />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-[350px] max-h-96 overflow-y-auto p-4 space-y-4 z-50">
                    
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

          {(campaign.status === "idle" || campaign.status === "completed" || campaign.id === "camp-001" || campaign.isReactivation || campaign.name?.includes("Lead Reactivation")) && (
            <p className="text-sm text-muted-foreground">
              {(campaign.id === "camp-001" || campaign.isReactivation || campaign.name?.includes("Lead Reactivation"))
                ? "Failed calls from past campaigns can be scheduled for reactivation here."
                : !hasOutboundNumber 
                  ? "Please request an outbound number from the admin to launch campaigns." 
                  : "Upload a CSV contact list to prepare your next outbound campaign."}
            </p>
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
                            {campaign.status === "running" ? (
                              <span className="text-emerald-500">Running</span>
                            ) : campaign.status === "paused" ? (
                              <span className="text-amber-500">Paused</span>
                            ) : campaign.status === "completed" ? (
                              <span className="text-emerald-500">Completed</span>
                            ) : isPending ? (
                              <span className="text-amber-500">Pending</span>
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
                              <div className="flex items-center gap-2 text-muted-foreground pl-6">
                                <span className="font-medium text-foreground truncate max-w-[120px]" title={schedule.csvName}>
                                  {schedule.csvName ? schedule.csvName : "Campaign Schedule"}
                                </span>
                                <span className="text-muted-foreground">•</span>
                                
                                {/* Failed calls with Info Popover */}
                                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                  <span>{schedule.leadsCount || (schedule.leads?.length || 0)} Leads</span>
                                  {schedule.leads && schedule.leads.length > 0 && (
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <div className="flex size-5 cursor-pointer items-center justify-center rounded-full bg-muted hover:bg-muted-foreground/20 transition-colors" title="View Leads">
                                          <Info className="size-3 text-foreground" />
                                        </div>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-[300px] max-h-64 overflow-y-auto p-3 space-y-2 z-50">
                                        <p className="font-semibold text-sm">Leads</p>
                                        <div className="space-y-1">
                                          {schedule.leads.map((lead: any, iIdx: number) => (
                                            <div key={iIdx} className="flex justify-between items-center text-xs border-b border-border pb-1 hover:bg-muted/30 p-1 -mx-1 px-1 rounded">
                                              <span className="truncate max-w-[120px]">{lead.name}</span>
                                              <span className="font-mono">{lead.phone}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </PopoverContent>
                                    </Popover>
                                  )}
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
                                {onDeleteSchedule && !isPending && (
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
            {!hasOutboundNumber && campaign.id !== "camp-001" && !campaign.isReactivation && campaign.name !== "Lead Reactivation" ? (
              <Button onClick={handleRemindAdmin} disabled={reminding || isLocked} className="gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white">
                <PhoneOutgoing className="size-4" />
                {reminding ? "Sending..." : (isLocked ? "Request Sent" : "Request Outbound Number")}
              </Button>
            ) : (campaign.status === "idle" || campaign.status === "completed") && campaign.id !== "camp-001" && !campaign.isReactivation && campaign.name !== "Lead Reactivation" ? (
              <Button variant="outline" className="gap-2" onClick={onUploadClick}>
                <Upload className="size-4" />
                Upload CSV
              </Button>
            ) : null}

          {campaign.status === "ready" && (
            <div className="flex flex-col gap-2 items-end">
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2 text-destructive border-destructive/20 hover:bg-destructive/10" onClick={onClear}>
                  <Trash2 className="size-4" />
                  Clear File
                </Button>
                <Button className="gap-2" onClick={onStart} disabled={(campaign.leads || []).some((l: any) => !isValidPhoneNumber(l.phone))}>
                  <Play className="size-4" />
                  Start Campaign
                </Button>
              </div>
            </div>
          )}

          {campaign.status === "running" && (
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2 text-destructive border-destructive/20 hover:bg-destructive/10" onClick={onClear}>
                <Trash2 className="size-4" />
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

          {campaign.status === "paused" && (
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2 text-destructive border-destructive/20 hover:bg-destructive/10" onClick={onClear}>
                <Trash2 className="size-4" />
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

          {(campaign.id === "camp-001" || campaign.isReactivation || campaign.name === "Lead Reactivation") && (campaign.status === "idle" || campaign.status === "completed" || campaign.status === "scheduled") && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary/10 gap-2 h-9 text-sm"
                      onClick={onSchedule}
                      disabled={failedCallsCount === 0}
                    >
                      <CalendarClock className="size-4" />
                      Schedule Reactivation
                    </Button>
                  </div>
                </TooltipTrigger>
                {failedCallsCount === 0 && (
                  <TooltipContent>
                    <p>Available when there are failed calls</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          )}
          </div>
          {remindMessage && (
            <p className={`text-xs ${remindMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {remindMessage.text}
            </p>
          )}
        </div>
      </div>


    </motion.div>
  );
}
