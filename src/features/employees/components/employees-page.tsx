"use client";



import { useState } from "react";

import { Users } from "lucide-react";

import { motion } from "framer-motion";



import { PremiumChip } from "@/components/common/premium-badge";

import { AddCompanyModal } from "@/features/employees/components/add-company-modal";

import { CompanyCard } from "@/features/employees/components/company-card";

import { useAddCompanyAndNavigate } from "@/features/employees/hooks/use-add-company";

import { useEmployeesContext } from "@/features/employees/context/employees-context";



export function EmployeesPageContent() {

  const { companies } = useEmployeesContext();

  const addCompanyAndNavigate = useAddCompanyAndNavigate();

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

          {premiumCount > 0 && (

            <PremiumChip>

              {premiumCount} Premium client{premiumCount > 1 ? "s" : ""}

            </PremiumChip>

          )}

          <AddCompanyModal

            open={modalOpen}

            onOpenChange={setModalOpen}

            onSubmit={addCompanyAndNavigate}

          />

        </div>

      </motion.div>



      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

        {companies.map((company, index) => (

          <CompanyCard key={company.id} company={company} index={index} />

        ))}

      </div>

    </div>

  );

}

