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
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import type { Campaign } from "@/features/outbound/types";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  Campaign["status"],
  { label: string; variant: "default" | "secondary" | "success" | "warning" | "gold" }
> = {
  idle: { label: "No Schedule", variant: "secondary" },
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
  onEditLead?: (index: number, newLead: any) => void;
  onDeleteLead?: (index: number) => void;
  onSchedule?: () => void;
  failedCallsCount?: number;
  hasOutboundNumber?: boolean;
  className?: string;
  companyId?: string;
};

function LeadRow({ lead, idx, onSave, onDelete }: { lead: any; idx: number; onSave: (newLead: any) => void; onDelete?: () => void }) {
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
    <div className="flex justify-between items-center text-xs border-b border-border pb-1 hover:bg-muted/30 p-1 -mx-1 px-1 rounded transition-colors group">
      <div className="flex items-center gap-2 overflow-hidden">
        <span className={cn("truncate max-w-[120px]", lead.called && "line-through text-muted-foreground", lead.isInvalid && "text-red-400 line-through")}>{lead.name}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={cn("font-mono", lead.called && "line-through text-muted-foreground", lead.isInvalid && "text-red-400 line-through")}>{lead.phone}</span>
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
  onEditLead,
  onDeleteLead,
  onSchedule,
  failedCallsCount = 0,
  hasOutboundNumber = true,
  className,
  companyId,
}: CampaignCardProps) {
  const status = statusConfig[campaign.status];
  const isComingSoon = campaign.comingSoon === true;

  const [reminding, setReminding] = useState(false);
  const [remindMessage, setRemindMessage] = useState<{text: string, type: string} | null>(null);
  const [isLocked, setIsLocked] = useState(false);

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
            <Badge variant={status.variant}>
              {status.label}
            </Badge>
          </div>

          {campaign.uploadedFileName && (
            <p className="text-sm text-muted-foreground">
              File: <span className="text-foreground">{campaign.uploadedFileName}</span>
              {" · "}
              <span className="text-foreground">{campaign.totalContacts}</span> contacts
            </p>
          )}

          {(campaign.status === "idle" || campaign.status === "completed") && (
            <p className="text-sm text-muted-foreground">
              {campaign.id === "camp-001"
                ? (campaign.leads && campaign.leads.length > 0
                    ? `Ready to reactivate ${campaign.leads.length} failed call(s).`
                    : "Failed calls will appear here for reactivation.")
                : !hasOutboundNumber 
                  ? "Please request an outbound number from the admin to launch campaigns." 
                  : "Upload a CSV contact list to prepare your next outbound campaign."}
            </p>
          )}

          {campaign.status === "scheduled" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarClock className="size-4" />
              <span>
                Scheduled for {campaign.scheduledAt ? new Date(campaign.scheduledAt).toLocaleString() : "future"}
                {" · "}
                <span className="text-foreground">{campaign.totalContacts}</span> leads
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 items-end">
          <div className="flex flex-wrap gap-2 items-center">
            {(campaign.id !== "camp-001" && campaign.status !== "idle" && campaign.status !== "completed" && campaign.leads && campaign.leads.length > 0) && (
              <Popover>
                <PopoverTrigger asChild>
                  <div className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-muted/50 hover:bg-muted transition-colors">
                    <Info className="size-5 text-muted-foreground" />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-[350px] max-h-96 overflow-y-auto p-4 space-y-4 z-50">
                  
                  {(campaign.status === "ready" || campaign.status === "scheduled" || (campaign.id === "camp-001" && campaign.status === "idle")) && (
                    <div className="space-y-2">
                      <p className="font-semibold">{campaign.id === "camp-001" && campaign.status === "idle" ? "Failed (Pending Reactivation)" : "Pending"} ({(campaign.leads || []).length} Leads)</p>
                      {(campaign.leads || []).map((lead: any, idx: number) => (
                        <LeadRow key={`${lead.phone}-${idx}`} lead={lead} idx={idx} onSave={(newLead) => onEditLead?.(idx, newLead)} onDelete={campaign.status === "ready" ? () => onDeleteLead?.(idx) : undefined} />
                      ))}
                    </div>
                  )}

                  {(campaign.status === "running" || campaign.status === "completed") && (
                    <div className="space-y-4">
                      {(campaign.leads || []).filter((l: any) => !l.called).length > 0 && (
                        <div className="space-y-2">
                          <p className="font-semibold text-muted-foreground">Pending ({(campaign.leads || []).filter((l: any) => !l.called).length})</p>
                          {(campaign.leads || []).filter((l: any) => !l.called).map((lead: any, idx: number) => (
                            <LeadRow key={`${lead.phone}-${idx}`} lead={lead} idx={idx} onSave={() => {}} />
                          ))}
                        </div>
                      )}
                      
                      {(campaign.leads || []).filter((l: any) => l.called && !l.isFailed).length > 0 && (
                        <div className="space-y-2">
                          <p className="font-semibold text-emerald-500">Successful ({(campaign.leads || []).filter((l: any) => l.called && !l.isFailed).length})</p>
                          {(campaign.leads || []).filter((l: any) => l.called && !l.isFailed).map((lead: any, idx: number) => (
                            <LeadRow key={`${lead.phone}-${idx}`} lead={lead} idx={idx} onSave={() => {}} />
                          ))}
                        </div>
                      )}

                      {campaign.id !== "camp-001" && campaign.status !== "completed" && (campaign.leads || []).filter((l: any) => l.called && l.isFailed).length > 0 && (
                        <div className="space-y-2">
                          <p className="font-semibold text-rose-500">Failed ({(campaign.leads || []).filter((l: any) => l.called && l.isFailed).length})</p>
                          {(campaign.leads || []).filter((l: any) => l.called && l.isFailed).map((lead: any, idx: number) => (
                            <LeadRow key={`${lead.phone}-${idx}`} lead={lead} idx={idx} onSave={() => {}} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </PopoverContent>
              </Popover>
            )}

            {!hasOutboundNumber && campaign.id !== "camp-001" ? (
              <Button onClick={handleRemindAdmin} disabled={reminding || isLocked} className="gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white">
                <PhoneOutgoing className="size-4" />
                {reminding ? "Sending..." : (isLocked ? "Request Sent" : "Request Outbound Number")}
              </Button>
            ) : (campaign.status === "idle" || campaign.status === "completed") && campaign.id !== "camp-001" ? (
              <Button variant="outline" className="gap-2" onClick={onUploadClick}>
                <Upload className="size-4" />
                Upload CSV
              </Button>
            ) : null}

          {campaign.status === "ready" && (
            <Button className="gap-2" onClick={onStart} disabled={campaign.leads?.some((l: any) => l.isInvalid)}>
              <Play className="size-4" />
              Start Campaign
            </Button>
          )}

          {campaign.status === "running" && (
            <Button variant="secondary" className="gap-2 relative overflow-hidden group min-w-40" onClick={onPause}>
              <div className="absolute inset-0 bg-primary/10 w-full rounded-md z-0" />
              <motion.div 
                className="absolute inset-0 bg-primary/20 rounded-md z-0" 
                style={{ width: `${progressPercent}%` }} 
                layout 
              />
              <span className="relative z-10 flex items-center gap-2">
                <Pause className="size-4 hidden group-hover:block" />
                <span className="group-hover:hidden">Processing {campaign.completedCalls} / {campaign.totalContacts}</span>
                <span className="hidden group-hover:block">Pause</span>
              </span>
            </Button>
          )}

          {campaign.status === "paused" && (
            <Button className="gap-2 relative overflow-hidden group min-w-40" onClick={onResume}>
              <div className="absolute inset-0 bg-primary/10 w-full rounded-md z-0" />
              <motion.div 
                className="absolute inset-0 bg-primary/20 rounded-md z-0" 
                style={{ width: `${progressPercent}%` }} 
                layout 
              />
              <span className="relative z-10 flex items-center gap-2">
                <Play className="size-4 hidden group-hover:block" />
                <span className="group-hover:hidden">Paused {campaign.completedCalls} / {campaign.totalContacts}</span>
                <span className="hidden group-hover:block">Resume</span>
              </span>
            </Button>
          )}

          {campaign.id === "camp-001" && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button 
                      variant="outline" 
                      className="gap-2 border-dashed" 
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
