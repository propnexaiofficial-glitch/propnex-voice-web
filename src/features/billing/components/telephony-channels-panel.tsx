"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";

import { PremiumBadge } from "@/components/common/premium-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TelephonyChannel } from "@/features/billing/types";

type TelephonyChannelsPanelProps = {
  channels: TelephonyChannel[];
};

const typeIcons = {
  inbound: PhoneIncoming,
  outbound: PhoneOutgoing,
  both: Phone,
};

const statusStyles = {
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  inactive: "bg-white/5 text-muted-foreground border-white/10",
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/25",
};

export function TelephonyChannelsPanel({ channels }: TelephonyChannelsPanelProps) {
  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15">
            <Phone className="size-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Telephony Channels</h3>
            <p className="text-xs text-muted-foreground">
              Phone numbers and SIP trunks for voice AI
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <Plus className="size-3.5" />
          Add Channel
        </Button>
      </div>

      <div className="space-y-3">
        {channels.map((channel, index) => {
          const TypeIcon = typeIcons[channel.type];

          return (
            <motion.div
              key={channel.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between",
                channel.isPremium && "border-gold/20 bg-gold/5"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-lg",
                    channel.isPremium ? "bg-gold/15" : "bg-primary/15"
                  )}
                >
                  <TypeIcon
                    className={cn(
                      "size-4",
                      channel.isPremium ? "text-gold" : "text-primary"
                    )}
                  />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{channel.label}</p>
                    {channel.isPremium && <PremiumBadge size="sm" />}
                  </div>
                  <p className="font-mono text-xs text-muted-foreground">
                    {channel.number}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {channel.provider}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <Badge variant="outline" className="capitalize text-[10px]">
                  {channel.type === "both" ? (
                    <>
                      <ArrowDownLeft className="size-3" />
                      <ArrowUpRight className="size-3" />
                      Both
                    </>
                  ) : (
                    channel.type
                  )}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn("text-[10px] capitalize", statusStyles[channel.status])}
                >
                  {channel.status}
                </Badge>
                <Button variant="ghost" size="sm" className="h-7 text-xs">
                  Manage
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
