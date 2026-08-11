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
    // Create an initial state where values are "..." or 0 to avoid flashing fake data
    return mockStats.map(stat => ({
      ...stat,
      value: "..."
    }));
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("accessToken") || localStorage.getItem("access_token");
        if (!token) return;

        const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const response = await fetch(`${apiBase}/users/dashboard-stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          // Update the structure with real values
          const updatedStats = [...stats];
          
          updatedStats[0] = { ...updatedStats[0], value: data.inboundCalls.toLocaleString() };
          updatedStats[1] = { ...updatedStats[1], value: data.outboundCalls.toLocaleString() };
          updatedStats[2] = { ...updatedStats[2], value: data.activeAgents.toLocaleString() };
          updatedStats[3] = { ...updatedStats[3], value: data.creditsUsed.toLocaleString() };
          
          setStats(updatedStats);
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
      <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-4", loading && "opacity-60")}>
        {stats.map((stat, index) => (
          <StatCard key={stat.id} stat={stat} index={index} />
        ))}
      </div>
    </section>
  );
}

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
      <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-4", loading && "opacity-60")}>
        {stats.map((stat, index) => (
          <StatCard key={stat.id} stat={stat} index={index} />
        ))}
      </div>
    </section>
  );
}
