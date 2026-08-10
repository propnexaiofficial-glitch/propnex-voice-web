"use client";

import { useMemo, useState } from "react";
import { Receipt } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { TablePagination } from "@/components/tables/table-pagination";
import { cn } from "@/lib/utils";
import type { BillingHistoryItem } from "@/features/billing/types";

type BillingHistoryTableProps = {
  items: BillingHistoryItem[];
};

const PAGE_SIZE = 5;

const typeStyles = {
  "top-up": "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  usage: "bg-muted text-foreground border-border",
  subscription: "bg-muted text-foreground border-border",
};

const statusStyles = {
  completed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  failed: "bg-red-500/15 text-red-400 border-red-500/25",
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function BillingHistoryTable({ items }: BillingHistoryTableProps) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, [items, page]);

  return (
    <div className="glass-card overflow-hidden rounded-2xl">
      <div className="flex items-center gap-2 border-b border-border px-6 py-4">
        <Receipt className="size-4 text-foreground" />
        <div>
          <h3 className="text-sm font-semibold">Billing History</h3>
          <p className="text-xs text-muted-foreground">
            Recent transactions and usage charges
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium text-right">Credits</th>
              <th className="px-4 py-3 font-medium text-right">Amount</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((item) => (
              <tr
                key={item.id}
                className="border-b border-border transition-colors hover:bg-muted/50"
              >
                <td className="whitespace-nowrap px-6 py-3.5 text-xs text-muted-foreground">
                  {formatDate(item.date)}
                </td>
                <td className="max-w-[220px] truncate px-4 py-3.5 font-medium">
                  {item.description}
                </td>
                <td className="px-4 py-3.5">
                  <Badge
                    variant="outline"
                    className={cn("text-[10px] capitalize", typeStyles[item.type])}
                  >
                    {item.type.replace("-", " ")}
                  </Badge>
                </td>
                <td
                  className={cn(
                    "px-4 py-3.5 text-right font-mono text-xs",
                    item.credits > 0 && "text-emerald-400",
                    item.credits < 0 && "text-red-400"
                  )}
                >
                  {item.credits === 0
                    ? "—"
                    : `${item.credits > 0 ? "+" : ""}${item.credits.toLocaleString()}`}
                </td>
                <td className="px-4 py-3.5 text-right font-mono text-xs">
                  {item.amount === 0 ? "—" : `SGD ${item.amount}`}
                </td>
                <td className="px-6 py-3.5">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] capitalize",
                      statusStyles[item.status]
                    )}
                  >
                    {item.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-border px-4 py-3">
        <TablePagination
          page={page}
          totalPages={totalPages}
          totalItems={items.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
