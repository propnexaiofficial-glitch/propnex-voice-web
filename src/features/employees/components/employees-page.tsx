"use client";

import { useState } from "react";
import { Users, Building2 } from "lucide-react";
import { motion } from "framer-motion";

import { AddCompanyModal } from "@/features/employees/components/add-company-modal";
import { CompanyCard } from "@/features/employees/components/company-card";
import { useAddCompanyAndNavigate } from "@/features/employees/hooks/use-add-company";
import { useEmployeesContext } from "@/features/employees/context/employees-context";

export function EmployeesPageContent() {
  const { companies, loading } = useEmployeesContext();
  const addCompanyAndNavigate = useAddCompanyAndNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
            <Users className="size-5 text-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Sub-Companies</h2>
            <p className="text-sm text-muted-foreground">
              Manage client accounts and monitor their usage
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <AddCompanyModal
            open={modalOpen}
            onOpenChange={setModalOpen}
            onSubmit={addCompanyAndNavigate}
          />
        </div>
      </motion.div>

      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center rounded-xl border border-border bg-card/50 py-16"
        >
          <div className="size-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">Loading sub-companies...</p>
        </motion.div>
      ) : companies.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16"
        >
          <div className="flex size-14 items-center justify-center rounded-full bg-muted/60">
            <Building2 className="size-7 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-sm font-semibold text-foreground">
            No sub-companies record found
          </h3>
          <p className="mt-1 max-w-xs text-center text-xs text-muted-foreground">
            Get started by adding your first sub-company using the button above.
          </p>
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {companies.map((company, index) => (
            <CompanyCard key={company.id} company={company} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
