"use client";

import { DashboardHeader } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { usePageTitle } from "@/hooks/use-page-title";
import { cn } from "@/lib/utils";

type DashboardShellProps = {
  children: React.ReactNode;
  className?: string;
};

export function DashboardShell({ children, className }: DashboardShellProps) {
  const title = usePageTitle();

  return (
    <TooltipProvider>
      <div className="flex min-h-screen bg-background">
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
    </TooltipProvider>
  );
}
