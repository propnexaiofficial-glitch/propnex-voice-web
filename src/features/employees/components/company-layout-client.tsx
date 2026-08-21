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
  const { getCompanyById, loading } = useEmployeesContext();
  const company = getCompanyById(companyId);

  if (loading && !company) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
      </div>
    );
  }

  if (!company) {
    notFound();
  }

  return (
    <CompanyWorkspaceLayout company={company}>{children}</CompanyWorkspaceLayout>
  );
}
