"use client";

import { ArrowDownRight, ArrowUpRight, PhoneIncoming, PhoneOutgoing } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import type { DashboardStat } from "@/features/home/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type StatCardProps = {
  stat: DashboardStat;
  index?: number;
  className?: string;
};

export function StatCard({ stat, index = 0, className }: StatCardProps) {
  const isPositive = stat.change !== undefined && stat.change >= 0;
  const Icon = stat.icon;
  const isCredits = stat.id === "credits-used";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className={cn("glass-card rounded-lg p-5", className)}
    >
      <div className="flex items-center justify-between">
        <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-foreground">
          <Icon className="size-5" />
        </div>
        
        {isCredits && stat.inboundCreditsUsed !== undefined && stat.outboundCreditsUsed !== undefined && (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 rounded-md bg-muted/50 px-2.5 py-1.5 cursor-help transition-colors hover:bg-muted">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <PhoneIncoming className="size-3 text-purple-400" />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <PhoneOutgoing className="size-3 text-blue-400" />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="flex flex-col gap-1.5 bg-background border-border shadow-xl">
                <p className="text-xs font-medium text-muted-foreground mb-1">Credit Usage Breakdown</p>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <PhoneIncoming className="size-3.5 text-purple-400" />
                    <span className="text-sm">Inbound</span>
                  </div>
                  <span className="text-sm font-medium">{stat.inboundCreditsUsed.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <PhoneOutgoing className="size-3.5 text-blue-400" />
                    <span className="text-sm">Outbound</span>
                  </div>
                  <span className="text-sm font-medium">{stat.outboundCreditsUsed.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })}</span>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <div className="mt-4 space-y-1">
        <p className="text-sm text-muted-foreground">{stat.title}</p>
        <p className="text-2xl font-semibold tracking-tight text-foreground">
          {typeof stat.value === "number"
            ? stat.value.toLocaleString()
            : stat.value}
        </p>
      </div>

      {stat.isNewAccount ? (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <span className="inline-flex items-center rounded-sm bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-500">
            Storing data for next month
          </span>
        </div>
      ) : stat.id === "total-agents" ? (
        <div className="mt-3 flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 text-emerald-500 font-medium">
            <span className="size-1.5 rounded-full bg-emerald-500"></span>
            {stat.assignedAgents ?? 0} Assigned
          </div>
          <span className="text-muted-foreground/30">•</span>
          <div className="flex items-center gap-1 text-muted-foreground">
            <span className="size-1.5 rounded-full bg-muted-foreground/50"></span>
            {stat.availableAgents ?? 0} Available
          </div>
        </div>
      ) : stat.id === "credits-used" ? (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <span className="inline-flex items-center rounded-sm bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-500">
            {stat.creditsPercentage ?? 0}% of total limit used
          </span>
        </div>
      ) : stat.change !== undefined && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          {isPositive ? (
            <ArrowUpRight className="size-3.5 text-emerald-500" />
          ) : (
            <ArrowDownRight className="size-3.5 text-red-400" />
          )}
          <span className={cn("font-medium", isPositive ? "text-emerald-500" : "text-red-400")}>
            {isPositive ? "+" : ""}
            {stat.change}%
          </span>
          <span className="text-muted-foreground">{stat.changeLabel}</span>
        </div>
      )}
    </motion.div>
  );
}
