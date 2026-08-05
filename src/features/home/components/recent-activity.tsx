"use client";

import {
  CreditCard,
  Mic2,
  PhoneIncoming,
  PhoneOutgoing,
} from "lucide-react";
import { motion } from "framer-motion";

import { recentActivity } from "@/features/home/data";
import type { RecentActivityItem } from "@/features/home/types";
import { cn } from "@/lib/utils";

const typeConfig: Record<
  RecentActivityItem["type"],
  { icon: typeof PhoneIncoming; color: string }
> = {
  inbound: { icon: PhoneIncoming, color: "bg-primary/15 text-primary" },
  outbound: { icon: PhoneOutgoing, color: "bg-blue-500/15 text-blue-400" },
  agent: { icon: Mic2, color: "bg-emerald-500/15 text-emerald-400" },
  billing: { icon: CreditCard, color: "bg-gold/15 text-gold" },
};

type RecentActivityProps = {
  className?: string;
};

export function RecentActivity({ className }: RecentActivityProps) {
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

      <div className="glass-card divide-y divide-border rounded-2xl">
        {recentActivity.map((item, index) => {
          const config = typeConfig[item.type];
          const Icon = config.icon;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.06 }}
              className="flex items-start gap-4 p-4 first:rounded-t-2xl last:rounded-b-2xl"
            >
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg",
                  config.color
                )}
              >
                <Icon className="size-4" />
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
        })}
      </div>
    </section>
  );
}
