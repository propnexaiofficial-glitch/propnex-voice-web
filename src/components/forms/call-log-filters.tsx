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
    filters.assignedNumber !== DEFAULT_CALL_FILTERS.assignedNumber ||
    filters.callerNumber !== DEFAULT_CALL_FILTERS.callerNumber ||
    filters.minDuration !== DEFAULT_CALL_FILTERS.minDuration;

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
        <div className="space-y-1.5">
          <label
            htmlFor={`${searchId}-assigned`}
            className="text-xs font-medium text-muted-foreground"
          >
            Assigned number
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id={`${searchId}-assigned`}
              placeholder="Filter assigned..."
              value={filters.assignedNumber}
              onChange={(e) => update({ assignedNumber: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor={`${searchId}-caller`}
            className="text-xs font-medium text-muted-foreground"
          >
            Caller number
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id={`${searchId}-caller`}
              placeholder="Filter caller..."
              value={filters.callerNumber}
              onChange={(e) => update({ callerNumber: e.target.value })}
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

        <div className="space-y-1.5">
          <label
            htmlFor={`${searchId}-duration`}
            className="text-xs font-medium text-muted-foreground"
          >
            Min Duration (sec)
          </label>
          <Input
            id={`${searchId}-duration`}
            type="number"
            min="0"
            step="any"
            placeholder="e.g. 2"
            value={filters.minDuration}
            onChange={(e) => update({ minDuration: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
