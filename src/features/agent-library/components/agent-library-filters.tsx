"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import type { AgentLibraryFilters } from "@/features/agent-library/types";
import { cn } from "@/lib/utils";

const quickFilters = [
  { value: "all", label: "All" },
  { value: "Female", label: "Female" },
  { value: "Male", label: "Male" },
  { value: "Professional", label: "Professional" },
  { value: "Outbound", label: "Outbound" },
  { value: "Support", label: "Support" },
  { value: "Sales", label: "Sales" },
];

type AgentLibraryFiltersBarProps = {
  filters: AgentLibraryFilters;
  onChange: (filters: AgentLibraryFilters) => void;
  totalCount: number;
  assignedCount: number;
  className?: string;
};

export function AgentLibraryFiltersBar({
  filters,
  onChange,
  totalCount,
  assignedCount,
  className,
}: AgentLibraryFiltersBarProps) {
  return (
    <div className={cn("glass-card space-y-4 rounded-2xl p-4", className)}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="agent-search"
            placeholder="Search by name, tone, or use case..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="pl-10"
          />
        </div>

        <p className="shrink-0 text-sm text-muted-foreground lg:text-right">
          <span className="font-medium text-foreground">{assignedCount}</span> assigned
          <span className="mx-2 text-border">·</span>
          <span className="font-medium text-foreground">{totalCount}</span> total
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {quickFilters.map((option) => {
          const active = filters.tag === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ ...filters, tag: option.value })}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "border-primary/40 bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/25 hover:text-foreground"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
