"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import type { DashboardStat } from "@/features/home/types";

const accentStyles = {
  purple: {
    icon: "gradient-primary glow-purple text-white",
  },
  blue: {
    icon: "bg-blue-500/20 text-blue-400",
  },
  green: {
    icon: "bg-emerald-500/20 text-emerald-400",
  },
  gold: {
    icon: "bg-gold/20 text-gold",
  },
};

type StatCardProps = {
  stat: DashboardStat;
  index?: number;
  className?: string;
};

export function StatCard({ stat, index = 0, className }: StatCardProps) {
  const styles = accentStyles[stat.accent];
  const isPositive = stat.change >= 0;
  const Icon = stat.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className={cn("glass-card rounded-2xl p-5", className)}
    >
      <div
        className={cn(
          "flex size-10 items-center justify-center rounded-xl",
          styles.icon
        )}
      >
        <Icon className="size-5" />
      </div>

      <div className="mt-4 space-y-1">
        <p className="text-sm text-muted-foreground">{stat.title}</p>
        <p className="text-2xl font-bold tracking-tight">
          {typeof stat.value === "number"
            ? stat.value.toLocaleString()
            : stat.value}
        </p>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-xs">
        {isPositive ? (
          <ArrowUpRight className="size-3.5 text-emerald-400" />
        ) : (
          <ArrowDownRight className="size-3.5 text-rose-400" />
        )}
        <span
          className={cn(
            "font-medium",
            isPositive ? "text-emerald-400" : "text-rose-400"
          )}
        >
          {isPositive ? "+" : ""}
          {stat.change}%
        </span>
        <span className="text-muted-foreground">{stat.changeLabel}</span>
      </div>
    </motion.div>
  );
}
