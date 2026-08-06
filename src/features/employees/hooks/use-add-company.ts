"use client";

import { useRouter } from "next/navigation";

import { useEmployeesContext } from "@/features/employees/context/employees-context";
import type { AddCompanyForm } from "@/features/employees/types";

export function useAddCompanyAndNavigate() {
  const router = useRouter();
  const { addCompany } = useEmployeesContext();

  return (form: AddCompanyForm) => {
    const company = addCompany(form);
    router.push(`/dashboard/employees/${company.id}/overview`);
  };
}
