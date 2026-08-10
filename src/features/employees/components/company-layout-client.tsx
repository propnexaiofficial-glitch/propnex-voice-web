"use client";

import { notFound } from "next/navigation";

import { CompanyWorkspaceLayout } from "@/features/employees/components/company-workspace-layout";
import { useEmployeesContext } from "@/features/employees/context/employees-context";

type CompanyLayoutClientProps = {
  companyId: string;
  children: React.ReactNode;
};

export function CompanyLayoutClient({
  companyId,
  children,
}: CompanyLayoutClientProps) {
  const { getCompanyById } = useEmployeesContext();
  const company = getCompanyById(companyId);

  if (!company) {
    notFound();
  }

  return (
    <CompanyWorkspaceLayout company={company}>{children}</CompanyWorkspaceLayout>
  );
}
