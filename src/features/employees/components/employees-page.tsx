"use client";

import { useState } from "react";
import { Building2, Users } from "lucide-react";
import { motion } from "framer-motion";

import { PremiumChip } from "@/components/common/premium-badge";
import { AddCompanyModal } from "@/features/employees/components/add-company-modal";
import { CompanyCard } from "@/features/employees/components/company-card";
import { CompanyDetailPanel } from "@/features/employees/components/company-detail-panel";
import { useEmployees } from "@/features/employees/hooks/use-employees";

export function EmployeesPageContent() {
  const {
    companies,
    selectedCompany,
    selectedId,
    setSelectedId,
    previewCalls,
    addCompany,
  } = useEmployees();

  const [modalOpen, setModalOpen] = useState(false);
  const premiumCount = companies.filter((c) => c.isPremium).length;

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15">
            <Users className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Sub-Companies</h2>
            <p className="text-sm text-muted-foreground">
              Manage client accounts and monitor their usage
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {premiumCount > 0 && (
            <PremiumChip>
              {premiumCount} Premium client{premiumCount > 1 ? "s" : ""}
            </PremiumChip>
          )}
          <AddCompanyModal
            open={modalOpen}
            onOpenChange={setModalOpen}
            onSubmit={addCompany}
          />
        </div>
      </motion.div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(260px,300px)_1fr]">
        <aside className="glass-card flex flex-col rounded-2xl p-4">
          <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-semibold">Companies</h3>
            <span className="text-xs text-muted-foreground">{companies.length}</span>
          </div>
          <div className="flex max-h-[min(520px,calc(100vh-14rem))] flex-col gap-2 overflow-y-auto pr-0.5">
            {companies.map((company, index) => (
              <CompanyCard
                key={company.id}
                company={company}
                isSelected={selectedId === company.id}
                onSelect={setSelectedId}
                index={index}
              />
            ))}
          </div>
        </aside>

        <section className="min-w-0">
          {selectedCompany ? (
            <CompanyDetailPanel
              company={selectedCompany}
              previewCalls={previewCalls}
            />
          ) : (
            <div className="glass-card flex min-h-[320px] flex-col items-center justify-center rounded-2xl p-8 text-center">
              <Building2 className="size-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm font-medium">Select a company</p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                Choose a sub-company from the list to view usage and call previews
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
