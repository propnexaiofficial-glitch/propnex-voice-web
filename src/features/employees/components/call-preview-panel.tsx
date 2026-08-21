"use client";

import { PhoneIncoming, PhoneOutgoing } from "lucide-react";

import { StatusBadge } from "@/components/common/status-badge";
import type { CallPreview } from "@/features/employees/types";
import { cn } from "@/lib/utils";

type CallPreviewPanelProps = {
  calls: CallPreview[];
  direction: "inbound" | "outbound";
  className?: string;
  isLocked?: boolean;
};

export function CallPreviewPanel({
  calls,
  direction,
  className,
  isLocked,
}: CallPreviewPanelProps) {
  const filtered = calls.filter((c) => c.direction === direction);
  const Icon = direction === "inbound" ? PhoneIncoming : PhoneOutgoing;
  const label = direction === "inbound" ? "Inbound" : "Outbound";

  return (
    <div className={cn("glass-card flex flex-col rounded-xl p-4", className)}>
      <div className="mb-3 flex items-center gap-2 border-b border-border pb-3">
        <Icon className="size-4 shrink-0 text-foreground" />
        <h4 className="text-sm font-semibold">{label} Preview</h4>
        {!isLocked && (
          <span className="ml-auto text-[11px] text-muted-foreground">
            {filtered.length} recent
          </span>
        )}
      </div>

      {isLocked ? (
        <p className="flex flex-1 items-center justify-center py-6 text-center text-xs text-muted-foreground">
          Waiting for phone assignment
        </p>
      ) : filtered.length === 0 ? (
        <p className="flex flex-1 items-center justify-center py-6 text-center text-xs text-muted-foreground">
          No {direction} calls yet
        </p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((call) => (
            <li
              key={call.id}
              className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-0.5 rounded-lg border border-border bg-muted/50 px-3 py-2.5"
            >
              <p className="truncate text-xs font-medium">{call.customerNumber}</p>
              <StatusBadge status={call.status} />
              <p className="text-[10px] text-muted-foreground">{call.date}</p>
              <p className="text-right text-[10px] tabular-nums text-muted-foreground">
                {call.duration}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
