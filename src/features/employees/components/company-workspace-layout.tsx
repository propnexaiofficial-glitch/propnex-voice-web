"use client";

import { CompanySidebar } from "@/features/employees/components/company-sidebar";
import type { SubCompany } from "@/features/employees/types";

type CompanyWorkspaceLayoutProps = {
  company: SubCompany;
  children: React.ReactNode;
};

export function CompanyWorkspaceLayout({
  company,
  children,
}: CompanyWorkspaceLayoutProps) {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
      <CompanySidebar company={company} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
