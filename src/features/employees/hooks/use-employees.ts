"use client";

import { useEmployeesContext } from "@/features/employees/context/employees-context";

export function useEmployees() {
  const { companies, getCompanyById, getPreviewCalls, addCompany } =
    useEmployeesContext();

  return {
    companies,
    getCompanyById,
    getPreviewCalls,
    addCompany,
  };
}
