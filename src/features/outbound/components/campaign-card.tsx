"use client";

import {
  CheckCircle2,
  Pause,
  PhoneOutgoing,
  Play,
  Upload,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Campaign } from "@/features/outbound/types";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  Campaign["status"],
  { label: string; variant: "default" | "secondary" | "success" | "warning" | "gold" }
> = {
  idle: { label: "No Campaign", variant: "secondary" },
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
  className?: string;
};

export function CampaignCard({
  campaign,
  progressPercent,
  onUploadClick,
  onStart,
  onPause,
  onResume,
  className,
}: CampaignCardProps) {
  const status = statusConfig[campaign.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("glass-card rounded-2xl p-6", className)}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-blue-500/15">
              <PhoneOutgoing className="size-5 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold">{campaign.name}</h3>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>

          {campaign.uploadedFileName && (
            <p className="text-sm text-muted-foreground">
              File: <span className="text-foreground">{campaign.uploadedFileName}</span>
              {" · "}
              <span className="text-foreground">{campaign.totalContacts}</span> contacts
            </p>
          )}

          {campaign.status === "idle" && (
            <p className="text-sm text-muted-foreground">
              Upload a CSV contact list to prepare your outbound campaign.
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" onClick={onUploadClick}>
            <Upload className="size-4" />
            Upload CSV
          </Button>

          {campaign.status === "ready" && (
            <Button className="gap-2" onClick={onStart}>
              <Play className="size-4" />
              Start Campaign
            </Button>
          )}

          {campaign.status === "running" && (
            <Button variant="secondary" className="gap-2" onClick={onPause}>
              <Pause className="size-4" />
              Pause
            </Button>
          )}

          {campaign.status === "paused" && (
            <Button className="gap-2" onClick={onResume}>
              <Play className="size-4" />
              Resume
            </Button>
          )}
        </div>
      </div>

      {(campaign.status === "running" ||
        campaign.status === "paused" ||
        campaign.status === "ready") &&
        campaign.totalContacts > 0 && (
          <div className="mt-6 space-y-4 border-t border-border pt-6">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Campaign Progress</span>
              <span className="text-primary font-semibold">{progressPercent}%</span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="h-full rounded-full gradient-primary glow-purple"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-border/60 bg-white/5 px-3 py-2.5">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="size-3.5" />
                  Total
                </div>
                <p className="mt-1 text-lg font-semibold">
                  {campaign.totalContacts}
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-white/5 px-3 py-2.5">
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="mt-1 text-lg font-semibold">
                  {campaign.completedCalls}
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-white/5 px-3 py-2.5">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CheckCircle2 className="size-3.5 text-emerald-400" />
                  Successful
                </div>
                <p className="mt-1 text-lg font-semibold text-emerald-400">
                  {campaign.successfulCalls}
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-white/5 px-3 py-2.5">
                <p className="text-xs text-muted-foreground">Failed</p>
                <p className="mt-1 text-lg font-semibold text-rose-400">
                  {campaign.failedCalls}
                </p>
              </div>
            </div>
          </div>
        )}
    </motion.div>
  );
}
