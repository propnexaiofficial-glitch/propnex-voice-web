"use client";

import { Phone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AssignedChannel } from "@/features/billing/types";

type AssignedChannelsPanelProps = {
  channels: AssignedChannel[];
};

export function AssignedChannelsPanel({ channels }: AssignedChannelsPanelProps) {
  return (
    <div className="glass-card overflow-hidden rounded-2xl p-6">
      <div className="mb-5 flex items-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15">
          <Phone className="size-4 text-primary" />
        </div>
        <h3 className="text-sm font-semibold">Assigned Channels</h3>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-border bg-white/5">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                DID No.
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                No. of Channels
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Purchased Channels
              </th>
            </tr>
          </thead>
          <tbody>
            {channels.map((channel) => (
              <tr
                key={channel.id}
                className="border-b border-border/60 transition-colors last:border-0 hover:bg-white/5"
              >
                <td className="px-4 py-3 font-mono font-medium">{channel.didNo}</td>
                <td className="px-4 py-3 tabular-nums">{channel.channelCount}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {channel.purchasedChannels.map((name) => (
                      <Badge
                        key={`${channel.id}-${name}`}
                        variant="outline"
                        className={cn(
                          "text-[10px] font-normal",
                          name.toLowerCase().includes("premium") &&
                            "border-primary/30 bg-primary/10 text-primary"
                        )}
                      >
                        {name}
                      </Badge>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
