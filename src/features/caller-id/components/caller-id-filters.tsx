"use client";

import { Search } from "lucide-react";

import { SelectField } from "@/components/forms/select-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CallerIdFilters } from "@/features/caller-id/types";
import { cn } from "@/lib/utils";

type CallerIdFiltersBarProps = {
  filters: CallerIdFilters;
  onChange: (filters: Partial<CallerIdFilters>) => void;
  onReset: () => void;
  className?: string;
};

export function CallerIdFiltersBar({
  filters,
  onChange,
  onReset,
  className,
}: CallerIdFiltersBarProps) {
  return (
    <div className={cn("glass-card space-y-4 rounded-2xl p-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">Filters</h3>
        <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={onReset}>
          Reset
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="caller-id-search" className="text-xs font-medium text-muted-foreground">
            Search
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="caller-id-search"
              placeholder="Label, number, or region..."
              value={filters.search}
              onChange={(e) => onChange({ search: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        <SelectField
          label="Type"
          value={filters.type}
          onChange={(e) =>
            onChange({ type: e.target.value as CallerIdFilters["type"] })
          }
        >
          <option value="all">All types</option>
          <option value="inbound">Inbound</option>
          <option value="outbound">Outbound</option>
          <option value="both">Both</option>
        </SelectField>

        <SelectField
          label="Verification"
          value={filters.verification}
          onChange={(e) =>
            onChange({
              verification: e.target.value as CallerIdFilters["verification"],
            })
          }
        >
          <option value="all">All statuses</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </SelectField>
      </div>
    </div>
  );
}
