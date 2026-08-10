"use client";

import { useEmployeesContext } from "@/features/employees/context/employees-context";

export function useEmployees() {
  const { companies, loading, getCompanyById, getPreviewCalls, addCompany, refreshCompanies } =
    useEmployeesContext();

  return {
    companies,
    loading,
    getCompanyById,
    getPreviewCalls,
    addCompany,
    refreshCompanies,
  };
}
