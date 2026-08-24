"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/cards/stat-card";
import { dashboardStats as mockStats } from "@/features/home/data";
import { cn } from "@/lib/utils";

type DashboardSummaryProps = {
  className?: string;
};

export function DashboardSummary({ className }: DashboardSummaryProps) {
  const [stats, setStats] = useState(() => {
    return mockStats.map(stat => ({
      ...stat,
      value: "..."
    }));
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const cached = localStorage.getItem("dashboardStats");
      if (cached) {
        const parsed = JSON.parse(cached);
        // Merge cached values back into mockStats so we don't lose the Icon component
        setStats(prev => prev.map((stat, i) => ({
          ...stat,
          value: parsed[i]?.value !== undefined ? parsed[i].value : stat.value,
          change: parsed[i]?.change !== undefined ? parsed[i].change : stat.change,
          changeLabel: parsed[i]?.changeLabel !== undefined ? parsed[i].changeLabel : stat.changeLabel
        })));
      }
    } catch(e) {}
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("accessToken") || localStorage.getItem("access_token");
        if (!token) return;

        const response = await fetch(`/api/users/dashboard-stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          // Update the structure with real values
          const updatedStats = [...stats];
          
          updatedStats[0] = { ...updatedStats[0], value: data.inboundCalls !== undefined ? data.inboundCalls.toLocaleString() : "0", change: data.inboundTrend !== undefined ? data.inboundTrend : 100, changeLabel: "vs last month", isNewAccount: data.isNewAccount };
          updatedStats[1] = { ...updatedStats[1], value: data.outboundCalls !== undefined ? data.outboundCalls.toLocaleString() : "0", change: data.outboundTrend !== undefined ? data.outboundTrend : 0, changeLabel: "vs last month", isNewAccount: data.isNewAccount };
          updatedStats[2] = { ...updatedStats[2], value: data.activeAgents !== undefined ? data.activeAgents.toLocaleString() : "0", change: data.agentsTrend !== undefined ? data.agentsTrend : 0, changeLabel: "new this week", isNewAccount: data.isNewAccount };
          updatedStats[3] = { ...updatedStats[3], value: data.creditsUsed !== undefined ? data.creditsUsed.toLocaleString() : "0", change: data.creditsTrend !== undefined ? data.creditsTrend : 0, changeLabel: "vs last month", isNewAccount: data.isNewAccount };
          
          setStats(updatedStats);
          try {
            localStorage.setItem("dashboardStats", JSON.stringify(updatedStats));
          } catch(e) {}
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

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
        {stats.map((stat, index) => (
          <StatCard key={stat.id} stat={stat} index={index} />
        ))}
      </div>
    </section>
  );
}

