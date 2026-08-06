"use client";

import { useState } from "react";
import { CheckCircle2, Clock, IdCard } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

import { EmptyState } from "@/components/common/empty-state";
import { TablePagination } from "@/components/tables/table-pagination";
import { AddCallerIdModal } from "@/features/caller-id/components/add-caller-id-modal";
import { CallerIdFiltersBar } from "@/features/caller-id/components/caller-id-filters";
import { CallerIdTable } from "@/features/caller-id/components/caller-id-table";
import { useCallerId } from "@/features/caller-id/hooks/use-caller-id";

type StatProps = {
  label: string;
  value: number;
  icon: LucideIcon;
};

function StatCard({ label, value, icon: Icon }: StatProps) {
  return (
    <div className="glass-card flex items-center gap-3 rounded-xl px-4 py-3.5">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="size-4 text-primary" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold tabular-nums">{value}</p>
      </div>
    </div>
  );
}

export function CallerIdPageContent() {
  const {
    records,
    filters,
    updateFilters,
    resetFilters,
    setDefault,
    addRecord,
    page,
    setPage,
    totalPages,
    totalRecords,
    pageSize,
    verifiedCount,
    pendingCount,
    totalCount,
  } = useCallerId();

  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15">
            <IdCard className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Caller ID</h2>
            <p className="text-sm text-muted-foreground">
              Manage phone numbers displayed on inbound and outbound calls
            </p>
          </div>
        </div>

        <AddCallerIdModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          onSubmit={addRecord}
        />
      </motion.div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Total numbers" value={totalCount} icon={IdCard} />
        <StatCard label="Verified" value={verifiedCount} icon={CheckCircle2} />
        <StatCard label="Pending verification" value={pendingCount} icon={Clock} />
      </div>

      <CallerIdFiltersBar
        filters={filters}
        onChange={updateFilters}
        onReset={resetFilters}
      />

      {records.length === 0 ? (
        <EmptyState
          title="No caller IDs found"
          description="Try adjusting your filters or add a new phone number."
        />
      ) : (
        <>
          <CallerIdTable records={records} onSetDefault={setDefault} />
          <TablePagination
            page={page}
            totalPages={totalPages}
            totalItems={totalRecords}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
