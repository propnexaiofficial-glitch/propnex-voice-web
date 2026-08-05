"use client";

import { useCallback, useState } from "react";

import { callPreviews, subCompanies } from "@/features/employees/data";
import type { AddCompanyForm, SubCompany } from "@/features/employees/types";

export function useEmployees() {
  const [companies, setCompanies] = useState<SubCompany[]>(subCompanies);
  const [selectedId, setSelectedId] = useState<string | null>(
    subCompanies[0]?.id ?? null
  );

  const selectedCompany = companies.find((c) => c.id === selectedId) ?? null;
  const previewCalls = selectedId ? (callPreviews[selectedId] ?? []) : [];

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
    setSelectedId(newCompany.id);
  }, []);

  return {
    companies,
    selectedCompany,
    selectedId,
    setSelectedId,
    previewCalls,
    addCompany,
  };
}
