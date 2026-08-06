"use client";

import { DashboardHeader } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { EmployeesProvider } from "@/features/employees/context/employees-context";
import { usePageTitle } from "@/hooks/use-page-title";
import { cn } from "@/lib/utils";

type DashboardShellProps = {
  children: React.ReactNode;
  className?: string;
};

function DashboardShellInner({
  children,
  className,
}: DashboardShellProps) {
  const title = usePageTitle();

  return (
    <div className="flex min-h-screen bg-background page-mesh-bg">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader title={title} />
        <main
          className={cn(
            "flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8",
            className
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export function DashboardShell({ children, className }: DashboardShellProps) {
  return (
    <TooltipProvider>
      <EmployeesProvider>
        <DashboardShellInner className={className}>{children}</DashboardShellInner>
      </EmployeesProvider>
    </TooltipProvider>
  );
}
