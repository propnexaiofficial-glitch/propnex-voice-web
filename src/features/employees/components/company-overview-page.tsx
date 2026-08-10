"use client";

import { CompanyOverviewSection } from "@/features/employees/components/company-overview-section";
import { useEmployeesContext } from "@/features/employees/context/employees-context";

type CompanyOverviewPageContentProps = {
  companyId: string;
};

export function CompanyOverviewPageContent({
  companyId,
}: CompanyOverviewPageContentProps) {
  const { getCompanyById, getPreviewCalls } = useEmployeesContext();
  const company = getCompanyById(companyId);

  if (!company) {
    return null;
  }

  return (
    <CompanyOverviewSection
      company={company}
      previewCalls={getPreviewCalls(companyId)}
    />
  );
}
