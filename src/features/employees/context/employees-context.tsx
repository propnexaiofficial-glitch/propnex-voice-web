"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import axios from "axios";
import type { AddCompanyForm, CallPreview, SubCompany } from "@/features/employees/types";
import { callPreviews } from "@/features/employees/data";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type EmployeesContextValue = {
  companies: SubCompany[];
  loading: boolean;
  getCompanyById: (id: string) => SubCompany | undefined;
  getPreviewCalls: (id: string) => CallPreview[];
  addCompany: (form: AddCompanyForm) => Promise<SubCompany>;
  refreshCompanies: () => Promise<void>;
};

const EmployeesContext = createContext<EmployeesContextValue | null>(null);

export function EmployeesProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<SubCompany[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/sub-companies`);
      const mapped: SubCompany[] = response.data.map((item: any) => ({
        id: item._id,
        name: item.companyName,
        contactEmail: item.companyEmail,
        contactPhone: "",
        creditsUsed: 0,
        creditsLimit: 2000,
        inboundCalls: 0,
        outboundCalls: 0,
        isPremium: false,
        status: item.status || "active",
        joinedDate: item.createdAt
          ? new Date(item.createdAt).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10),
      }));
      setCompanies(mapped);
    } catch (error) {
      console.error("Failed to fetch sub-companies:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const getCompanyById = useCallback(
    (id: string) => companies.find((company) => company.id === id),
    [companies]
  );

  const getPreviewCalls = useCallback(
    (id: string) => callPreviews[id] ?? [],
    []
  );

  const addCompany = useCallback(async (form: AddCompanyForm) => {
    const response = await axios.post(`${API_BASE}/sub-companies`, {
      companyName: form.name,
      companyEmail: form.contactEmail,
    });

    const item = response.data;
    const newCompany: SubCompany = {
      id: item._id,
      name: item.companyName,
      contactEmail: item.companyEmail,
      contactPhone: "",
      creditsUsed: 0,
      creditsLimit: 2000,
      inboundCalls: 0,
      outboundCalls: 0,
      isPremium: false,
      status: item.status || "active",
      joinedDate: item.createdAt
        ? new Date(item.createdAt).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
    };
    setCompanies((prev) => [newCompany, ...prev]);
    return newCompany;
  }, []);

  const value = useMemo(
    () => ({
      companies,
      loading,
      getCompanyById,
      getPreviewCalls,
      addCompany,
      refreshCompanies: fetchCompanies,
    }),
    [companies, loading, getCompanyById, getPreviewCalls, addCompany, fetchCompanies]
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
