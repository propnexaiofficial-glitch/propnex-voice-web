"use client";

import { Search, SlidersHorizontal } from "lucide-react";

import { SelectField } from "@/components/forms/select-field";
import { Input } from "@/components/ui/input";
import { tagFilterOptions } from "@/features/agent-library/data";
import type { AgentLibraryFilters } from "@/features/agent-library/types";
import { cn } from "@/lib/utils";

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
    <div className={cn("glass-card rounded-2xl p-4", className)}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="flex-1 space-y-1.5">
          <label
            htmlFor="agent-search"
            className="text-xs font-medium text-muted-foreground"
          >
            Search agents
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="agent-search"
              placeholder="Search by name or description..."
              value={filters.search}
              onChange={(e) =>
                onChange({ ...filters, search: e.target.value })
              }
              className="pl-10"
            />
          </div>
        </div>

        <div className="w-full lg:w-48">
          <SelectField
            label="Filter by tag"
            value={filters.tag}
            onChange={(e) =>
              onChange({ ...filters, tag: e.target.value })
            }
          >
            {tagFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm">
          <SlidersHorizontal className="size-4 text-primary" />
          <span className="text-muted-foreground">
            {assignedCount} assigned · {totalCount} total
          </span>
        </div>
      </div>
    </div>
  );
}
