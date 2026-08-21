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

  if (!company.contactPhone) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center space-y-4 px-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold">Sub-Company Locked</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          This sub-company is currently waiting for phone assignment. You cannot access its inner functions until an Admin has verified it.
        </p>
        <a 
          href="/dashboard/employees"
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Go Back
        </a>
      </div>
    );
  }

  return (
    <CompanyWorkspaceLayout company={company}>{children}</CompanyWorkspaceLayout>
  );
}
