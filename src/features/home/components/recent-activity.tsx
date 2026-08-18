"use client";

import {
  CreditCard,
  Mic2,
  PhoneIncoming,
  PhoneOutgoing,
} from "lucide-react";
import { motion } from "framer-motion";

import type { RecentActivityItem } from "@/features/home/types";
import { cn } from "@/lib/utils";

import { useState, useEffect } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";

const typeConfig: Record<
  RecentActivityItem["type"],
  { icon: typeof PhoneIncoming }
> = {
  inbound: { icon: PhoneIncoming },
  outbound: { icon: PhoneOutgoing },
  agent: { icon: Mic2 },
  billing: { icon: CreditCard },
};

type RecentActivityProps = {
  className?: string;
};

export function RecentActivity({ className }: RecentActivityProps) {
  const [data, setData] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const token = localStorage.getItem("accessToken") || localStorage.getItem("access_token");
        const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const response = await axios.get(`${apiBase}/users/recent-activity`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data && response.data.length > 0) {
          setData(response.data);
        } else {
          setData([]); 
        }
      } catch (err) {
        console.error("Failed to fetch recent activity", err);
        setData([]); 
      } finally {
        setLoading(false);
      }
    };
    
    // Initial fetch
    fetchActivity();
    
    // Poll every 10 seconds for real-time top ups
    const interval = setInterval(fetchActivity, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className={cn("space-y-4", className)}>
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          Recent Activity
        </h2>
        <p className="text-sm text-muted-foreground">
          Latest events across your voice AI platform
        </p>
      </div>

      <div className="glass-card divide-y divide-border rounded-2xl relative min-h-[200px]">
        {loading && data.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center space-y-2 p-8 text-center text-sm text-muted-foreground">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <PhoneIncoming className="h-5 w-5 text-muted-foreground/50" />
            </div>
            <p>No recent activity yet.</p>
          </div>
        ) : (
          data.map((item, index) => {
            const config = typeConfig[item.type] || typeConfig.inbound;
            const Icon = config.icon;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.06 }}
                className="flex items-start gap-4 p-4 first:rounded-t-2xl last:rounded-b-2xl"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Icon className="size-4 text-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">{item.title}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {item.timestamp}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </section>
  );
}
