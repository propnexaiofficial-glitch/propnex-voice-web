"use client";

import { Filter, RotateCcw, Search } from "lucide-react";

import { SelectField } from "@/components/forms/select-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CALL_STATUS_OPTIONS,
  DEFAULT_CALL_FILTERS,
  type CallLogFilters,
} from "@/types/call";
import { cn } from "@/lib/utils";

type CallLogFiltersBarProps = {
  filters: CallLogFilters;
  onChange: (filters: CallLogFilters) => void;
  onReset: () => void;
  searchId?: string;
  className?: string;
};

export function CallLogFiltersBar({
  filters,
  onChange,
  onReset,
  searchId = "call-log-search",
  className,
}: CallLogFiltersBarProps) {
  const update = (patch: Partial<CallLogFilters>) => {
    onChange({ ...filters, ...patch });
  };

  const hasActiveFilters =
    filters.search !== DEFAULT_CALL_FILTERS.search ||
    filters.status !== DEFAULT_CALL_FILTERS.status ||
    filters.dateFrom !== DEFAULT_CALL_FILTERS.dateFrom ||
    filters.dateTo !== DEFAULT_CALL_FILTERS.dateTo ||
    filters.durationSort !== DEFAULT_CALL_FILTERS.durationSort;

  return (
    <div className={cn("glass-card rounded-2xl p-4", className)}>
      <div className="mb-4 flex items-center gap-2">
        <Filter className="size-4 text-foreground" />
        <h3 className="text-sm font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-8 gap-1.5 text-xs"
            onClick={onReset}
          >
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-1.5 sm:col-span-2">
          <label
            htmlFor={searchId}
            className="text-xs font-medium text-muted-foreground"
          >
            Search phone number
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id={searchId}
              placeholder="Customer or assigned number..."
              value={filters.search}
              onChange={(e) => update({ search: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        <SelectField
          label="Status"
          value={filters.status}
          onChange={(e) =>
            update({
              status: e.target.value as CallLogFilters["status"],
            })
          }
        >
          {CALL_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>

        <div className="space-y-1.5">
          <label
            htmlFor={`${searchId}-from`}
            className="text-xs font-medium text-muted-foreground"
          >
            Date from
          </label>
          <Input
            id={`${searchId}-from`}
            type="date"
            value={filters.dateFrom}
            onChange={(e) => update({ dateFrom: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor={`${searchId}-to`}
            className="text-xs font-medium text-muted-foreground"
          >
            Date to
          </label>
          <Input
            id={`${searchId}-to`}
            type="date"
            value={filters.dateTo}
            onChange={(e) => update({ dateTo: e.target.value })}
          />
        </div>

        <SelectField
          label="Duration"
          value={filters.durationSort}
          onChange={(e) =>
            update({
              durationSort: e.target.value as CallLogFilters["durationSort"],
            })
          }
        >
          <option value="default">Default</option>
          <option value="desc">Longest First</option>
          <option value="asc">Shortest First</option>
        </SelectField>
      </div>
    </div>
  );
}
