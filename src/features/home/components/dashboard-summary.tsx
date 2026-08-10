"use client";

import { StatCard } from "@/components/cards/stat-card";
import { dashboardStats } from "@/features/home/data";
import { cn } from "@/lib/utils";

type DashboardSummaryProps = {
  className?: string;
};

export function DashboardSummary({ className }: DashboardSummaryProps) {
  return (
    <section className={cn("space-y-4", className)}>
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          Dashboard Summary
        </h2>
        <p className="text-sm text-muted-foreground">
          Voice AI performance overview for your account
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat, index) => (
          <StatCard key={stat.id} stat={stat} index={index} />
        ))}
      </div>
    </section>
  );
}
