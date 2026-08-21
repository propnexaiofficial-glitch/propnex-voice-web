"use client";

import { FileText } from "lucide-react";

import { RecordingPlayer } from "@/components/common/recording-player";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import type { CallRecord } from "@/types/call";
import { cn } from "@/lib/utils";

type CallLogTableProps = {
  calls: CallRecord[];
  onViewTranscript: (call: CallRecord) => void;
  variant?: "inbound" | "outbound";
  className?: string;
};

function formatCallDate(iso: string) {
  return new Intl.DateTimeFormat("en-SG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function getCallId(call: CallRecord) {
  if (call.callId) return call.callId;
  return call.id.toUpperCase().replace(/^IN-/, "INB-").replace(/^OUT-/, "OUT-");
}


export function CallLogTable({
  calls,
  onViewTranscript,
  variant = "outbound",
  className,
}: CallLogTableProps) {
  const isInbound = variant === "inbound";

  return (
    <div className={cn("glass-card overflow-hidden rounded-2xl", className)}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-sm">
          <thead>
            <tr className="border-b border-border bg-white/5">


              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Customer Number
              </th>

              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Assigned Number
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Call Date/Time
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Duration
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Recording
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Transcription
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                Credits
              </th>
            </tr>
          </thead>
          <tbody>
            {calls.map((call) => (
              <tr
                key={call.id}
                className="border-b border-border/60 transition-colors last:border-0 hover:bg-white/5"
              >

                <td className="px-4 py-3 text-muted-foreground">
                  {call.customerNumber}
                </td>

                <td className="px-4 py-3 text-muted-foreground">
                  {call.assignedNumber}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  {formatCallDate(call.callDateTime)}
                </td>
                <td className="px-4 py-3 tabular-nums">{call.duration}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={call.status} />
                </td>
                <td className="px-4 py-3">
                  {call.status === "completed" ? (
                    <RecordingPlayer
                      durationSeconds={call.durationSeconds}
                      audioUrl={call.recordingUrl}
                      compact
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                    disabled={!call.transcriptUrl}
                    onClick={() => onViewTranscript(call)}
                  >
                    <FileText className="size-3.5" />
                    View
                  </Button>
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-medium text-foreground">
                  {call.creditsUsed}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
