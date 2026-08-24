"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import type { DashboardStat } from "@/features/home/types";

type StatCardProps = {
  stat: DashboardStat;
  index?: number;
  className?: string;
};

export function StatCard({ stat, index = 0, className }: StatCardProps) {
  const isPositive = stat.change !== undefined && stat.change >= 0;
  const Icon = stat.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className={cn("glass-card rounded-lg p-5", className)}
    >
      <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-foreground">
        <Icon className="size-5" />
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
          <span className="inline-flex items-center rounded-sm bg-muted-foreground/20 px-2 py-0.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Gathering Data...
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
