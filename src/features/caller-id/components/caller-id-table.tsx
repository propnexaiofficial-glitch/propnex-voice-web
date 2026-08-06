"use client";

import { ArrowDownLeft, ArrowUpRight, Check, Phone, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CallerIdRecord } from "@/features/caller-id/types";
import { cn } from "@/lib/utils";

type CallerIdTableProps = {
  records: CallerIdRecord[];
  onSetDefault: (id: string) => void;
  className?: string;
};

const verificationStyles = {
  verified: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  failed: "bg-red-500/15 text-red-400 border-red-500/25",
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-SG", { dateStyle: "medium" }).format(
    new Date(iso)
  );
}

function TypeBadge({ type }: { type: CallerIdRecord["type"] }) {
  if (type === "both") {
    return (
      <Badge variant="outline" className="gap-1 text-[10px] capitalize">
        <ArrowDownLeft className="size-3" />
        <ArrowUpRight className="size-3" />
        Both
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1 text-[10px] capitalize">
      {type === "inbound" ? (
        <ArrowDownLeft className="size-3" />
      ) : (
        <ArrowUpRight className="size-3" />
      )}
      {type}
    </Badge>
  );
}

export function CallerIdTable({ records, onSetDefault, className }: CallerIdTableProps) {
  return (
    <div className={cn("glass-card overflow-hidden rounded-2xl", className)}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-border bg-white/5">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Label
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Phone Number
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Region
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Type
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Verification
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Assigned To
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Added
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr
                key={record.id}
                className="border-b border-border/60 transition-colors last:border-0 hover:bg-white/5"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Phone className="size-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{record.label}</p>
                      {record.isDefault && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-primary">
                          <Star className="size-3 fill-primary" />
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-muted-foreground">
                  {record.phoneNumber}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{record.region}</td>
                <td className="px-4 py-3">
                  <TypeBadge type={record.type} />
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] capitalize",
                      verificationStyles[record.verification]
                    )}
                  >
                    {record.verification}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {record.assignedTo ?? "—"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                  {formatDate(record.addedAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  {!record.isDefault && record.verification === "verified" ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => onSetDefault(record.id)}
                    >
                      Set default
                    </Button>
                  ) : record.isDefault ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                      <Check className="size-3.5" />
                      Active
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
