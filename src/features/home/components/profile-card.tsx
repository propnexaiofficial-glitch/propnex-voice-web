"use client";

import { Building2, Mail, Phone } from "lucide-react";
import { motion } from "framer-motion";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useUserContext } from "@/features/auth/context/user-context";

function getInitials(name: string) {
  if (!name || name.trim() === "") return "U";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type ProfileCardProps = {
  className?: string;
};

export function ProfileCard({ className }: ProfileCardProps) {
  const { user, isLoading } = useUserContext();

  const fullName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email?.split("@")[0] || "User"
    : "User";
  const email = user?.email || "—";
  const phone = user?.phone || "—";
  const companyName = user?.company?.name || user?.companyName || (user?.companyId ? "PropNex AI Technology" : "No Company");

  const detailedNumbers: any[] = user?.assignedNumbersDetailed || [];
  const mainNumbers = detailedNumbers.filter((d) => d.isMain);
  const subNumbers = detailedNumbers.filter((d) => !d.isMain);

  const groupNumbers = (numbers: any[]) => {
    const grouped: Record<string, string[]> = {};
    for (const d of numbers) {
      const name = d.companyName || "Unknown";
      if (!grouped[name]) grouped[name] = [];
      if (d.number) grouped[name].push(d.number);
    }
    return Object.entries(grouped).map(([companyName, nums]) => ({ companyName, numbers: nums }));
  };

  const groupedMainNumbers = groupNumbers(mainNumbers);
  const groupedSubNumbers = groupNumbers(subNumbers);

  // Fallback for when detailed numbers aren't available yet
  const hasFallbackNumbers = detailedNumbers.length === 0 && user?.assignedNumber && user.assignedNumber !== "Not Assigned";
  const fallbackNumbers = hasFallbackNumbers
    ? user.assignedNumber.split(",").map((s: string) => s.trim()).filter(Boolean)
    : [];

  // Show skeleton while loading and no cached data
  if (isLoading && !user) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn("glass-card rounded-2xl p-6", className)}
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="relative shrink-0">
            <div className="size-20 rounded-full bg-muted animate-pulse" />
          </div>
          <div className="min-w-0 flex-1 space-y-4">
            <div className="space-y-2">
              <div className="h-6 w-40 rounded bg-muted animate-pulse" />
              <div className="h-4 w-56 rounded bg-muted animate-pulse" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn("glass-card rounded-2xl p-6", className)}
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="relative shrink-0">
          <div className="absolute -inset-1 rounded-full bg-muted blur-md" />
          <Avatar className="relative size-20 border-2 border-border">
            <AvatarFallback className="bg-muted text-lg text-foreground">
              {getInitials(fullName)}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight">{fullName}</h2>
              <Badge variant="success">Active</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Account owner · {companyName}
            </p>
          </div>

          {/* Top 3 info fields in a 2-column grid */}
          <div className="grid gap-3 sm:grid-cols-2">
            {/* Email */}
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 px-3 py-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Mail className="size-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Email</p>
                <p className="truncate text-sm font-medium">{email}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 px-3 py-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Phone className="size-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Phone</p>
                <p className="truncate text-sm font-medium">{phone}</p>
              </div>
            </div>

            {/* Company */}
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 px-3 py-2.5 sm:col-span-2">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Building2 className="size-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Company</p>
                <p className="truncate text-sm font-medium">{companyName}</p>
              </div>
            </div>
          </div>

          {/* Assigned Numbers — Two visible sections with masked display */}
          <div className="rounded-lg border border-border bg-muted/20 px-3 py-3 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Phone className="size-4 text-muted-foreground" />
              </div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Assigned Numbers
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 pl-11">
              {/* Main Company Numbers */}
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold border-b border-border pb-1">
                  Main Company
                </p>
                {groupedMainNumbers.length > 0 ? (
                  groupedMainNumbers.map((group, i) => (
                    <div key={i} className="flex items-center gap-1.5 flex-wrap">
                      <span className="size-1.5 rounded-full bg-green-500 shrink-0" />
                      <span className="text-xs text-muted-foreground mr-1">{group.companyName}</span>
                      {group.numbers.map((num, idx) => {
                        const last3 = num.replace(/\s/g, "").slice(-3);
                        return (
                          <span key={idx} className="flex items-center">
                            <span
                              title={num}
                              className="text-xs font-mono shrink-0 cursor-default group relative"
                            >
                              <span className="group-hover:hidden font-semibold text-foreground">•••{last3}</span>
                              <span className="hidden group-hover:inline font-semibold text-primary">{num}</span>
                            </span>
                            {idx < group.numbers.length - 1 && <span className="text-muted-foreground ml-0.5">,</span>}
                          </span>
                        );
                      })}
                    </div>
                  ))
                ) : fallbackNumbers.length > 0 ? (
                  fallbackNumbers.map((num: string, i: number) => {
                    const last3 = num.replace(/\s/g, "").slice(-3);
                    return (
                      <div key={i} className="flex items-center gap-1.5">
                        <span className="size-1.5 rounded-full bg-green-500 shrink-0" />
                        <span
                          title={num}
                          className="text-xs font-mono cursor-default group relative"
                        >
                          <span className="group-hover:hidden font-semibold text-foreground">•••{last3}</span>
                          <span className="hidden group-hover:inline font-semibold text-primary">{num}</span>
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <span className="text-xs text-muted-foreground italic">Not Assigned</span>
                )}
              </div>

              {/* Sub-Company Numbers */}
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold border-b border-border pb-1">
                  Sub-Companies
                </p>
                {groupedSubNumbers.length > 0 ? (
                  groupedSubNumbers.map((group, i) => (
                    <div key={i} className="flex items-start gap-1.5 flex-wrap">
                      <span className="size-1.5 rounded-full bg-blue-500 shrink-0 mt-1" />
                      <span className="text-xs text-muted-foreground mr-1">{group.companyName}</span>
                      <div className="flex flex-wrap items-center gap-1 ml-auto">
                        {group.numbers.map((num, idx) => {
                          const last3 = num.replace(/\s/g, "").slice(-3);
                          return (
                            <span key={idx} className="flex items-center">
                              <span
                                title={num}
                                className="text-xs font-mono shrink-0 cursor-default group relative"
                              >
                                <span className="group-hover:hidden font-semibold text-foreground">•••{last3}</span>
                                <span className="hidden group-hover:inline font-semibold text-primary">{num}</span>
                              </span>
                              {idx < group.numbers.length - 1 && <span className="text-muted-foreground ml-0.5">,</span>}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground italic">None</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
