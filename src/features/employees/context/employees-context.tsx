"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { callPreviews, subCompanies } from "@/features/employees/data";
import type { AddCompanyForm, CallPreview, SubCompany } from "@/features/employees/types";

type EmployeesContextValue = {
  companies: SubCompany[];
  getCompanyById: (id: string) => SubCompany | undefined;
  getPreviewCalls: (id: string) => CallPreview[];
  addCompany: (form: AddCompanyForm) => SubCompany;
};

const EmployeesContext = createContext<EmployeesContextValue | null>(null);

export function EmployeesProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<SubCompany[]>(subCompanies);

  const getCompanyById = useCallback(
    (id: string) => companies.find((company) => company.id === id),
    [companies]
  );

  const getPreviewCalls = useCallback(
    (id: string) => callPreviews[id] ?? [],
    []
  );

  const addCompany = useCallback((form: AddCompanyForm) => {
    const newCompany: SubCompany = {
      id: `co-${Date.now()}`,
      name: form.name,
      contactEmail: form.contactEmail,
      contactPhone: form.contactPhone,
      creditsUsed: 0,
      creditsLimit: 2000,
      inboundCalls: 0,
      outboundCalls: 0,
      isPremium: false,
      status: "active",
      joinedDate: new Date().toISOString().slice(0, 10),
    };
    setCompanies((prev) => [newCompany, ...prev]);
    return newCompany;
  }, []);

  const value = useMemo(
    () => ({
      companies,
      getCompanyById,
      getPreviewCalls,
      addCompany,
    }),
    [companies, getCompanyById, getPreviewCalls, addCompany]
  );

  return (
    <EmployeesContext.Provider value={value}>{children}</EmployeesContext.Provider>
  );
}

export function useEmployeesContext() {
  const context = useContext(EmployeesContext);
  if (!context) {
    throw new Error("useEmployeesContext must be used within EmployeesProvider");
  }
  return context;
}
