"use client";

import { DashboardHeader } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
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
  const [isWaiting, setIsWaiting] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reminding, setReminding] = useState(false);
  const [remindMessage, setRemindMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleRemindAdmin = async () => {
    try {
      setReminding(true);
      setRemindMessage(null);
      const token = localStorage.getItem("accessToken") || localStorage.getItem("access_token");
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      
      const res = await fetch(`${apiBase}/users/remind-admin`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        setRemindMessage({ text: "Reminder sent successfully! The admin has been notified.", type: "success" });
      } else {
        setRemindMessage({ text: "Failed to send reminder. The server might still be updating.", type: "error" });
      }
    } catch (e) {
      console.error(e);
      setRemindMessage({ text: "Failed to send reminder. Please check your connection.", type: "error" });
    } finally {
      setReminding(false);
    }
  };

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.approvalStatus === "REJECTED") {
          setIsRejected(true);
        } else if (!user.companyId && !user.contractId) {
          setIsWaiting(true);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isWaiting && !isRejected) return;

    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem("accessToken") || localStorage.getItem("access_token");
        if (!token) return;

        const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const response = await fetch(`${apiBase}/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
            if (data.user.approvalStatus === "REJECTED") {
              setIsRejected(true);
              setIsWaiting(false);
            } else if (data.user.companyId || data.user.contractId) {
              setIsWaiting(false);
              setIsRejected(false);
            } else {
              setIsWaiting(true);
              setIsRejected(false);
            }
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isWaiting, isRejected]);

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-background"><div className="animate-spin h-8 w-8 rounded-full border-4 border-fuchsia-500 border-r-transparent" /></div>;
  }

  if (isRejected) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 page-mesh-bg">
        <div className="mx-auto flex max-w-[400px] flex-col items-center justify-center space-y-6 text-center bg-zinc-900/50 backdrop-blur-md p-8 rounded-2xl border border-white/10">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <svg
              className="h-8 w-8 text-red-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Request Declined
            </h2>
            <p className="text-sm text-muted-foreground">
              Sorry, your account request was not accepted. Thank you for your interest.
            </p>
          </div>
          <button onClick={() => {
            localStorage.removeItem("user");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("access_token");
            window.location.href = "/auth/sign-in";
          }} className="text-sm text-fuchsia-400 hover:text-fuchsia-300">
            Sign out
          </button>
        </div>
      </div>
    );
  }

  if (isWaiting) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 page-mesh-bg">
        <div className="mx-auto flex max-w-[400px] flex-col items-center justify-center space-y-6 text-center bg-zinc-900/50 backdrop-blur-md p-8 rounded-2xl border border-white/10">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-fuchsia-500/10">
            <svg
              className="h-8 w-8 text-fuchsia-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Waiting for Approval
            </h2>
            <p className="text-sm text-muted-foreground">
              Your account request has been received. Please wait while an Administrator provisions your portal.
            </p>
          </div>
          <div className="flex flex-col w-full gap-3 mt-4">
            <button 
              onClick={handleRemindAdmin} 
              disabled={reminding}
              className="w-full rounded-md bg-fuchsia-600 px-4 py-2 text-sm font-semibold text-white hover:bg-fuchsia-500 disabled:opacity-50 transition-colors"
            >
              {reminding ? "Sending Reminder..." : "Remind Admin"}
            </button>
            
            {remindMessage && (
              <p className={`text-sm ${remindMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                {remindMessage.text}
              </p>
            )}

            <button onClick={() => {
              localStorage.removeItem("user");
              localStorage.removeItem("accessToken");
              localStorage.removeItem("access_token");
              window.location.href = "/auth/sign-in";
            }} className="text-sm text-fuchsia-400 hover:text-fuchsia-300">
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background page-mesh-bg">
      <Sidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
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
