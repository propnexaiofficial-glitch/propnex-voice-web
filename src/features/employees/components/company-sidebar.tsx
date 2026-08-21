"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Building2, Coins } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { PremiumBadge } from "@/components/common/premium-badge";
import {
  COMPANY_NAV_ITEMS,
  companyNavHref,
} from "@/constants/company-navigation";
import type { SubCompany } from "@/features/employees/types";
import { cn } from "@/lib/utils";
import { TransferCreditsModal } from "./transfer-credits-modal";

type CompanySidebarProps = {
  company: SubCompany;
  className?: string;
};

export function CompanySidebar({ company, className }: CompanySidebarProps) {
  const pathname = usePathname();
  const [transferOpen, setTransferOpen] = useState(false);

  const activeSegment = COMPANY_NAV_ITEMS.find((item) =>
    pathname.startsWith(companyNavHref(company.id, item.segment))
  )?.segment;

  return (
    <aside
      className={cn(
        "glass-card flex w-full shrink-0 flex-col rounded-xl lg:w-56 xl:w-60",
        className
      )}
    >
      <div className="border-b border-border p-4">
        <Link
          href="/dashboard/employees"
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          All companies
        </Link>

        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Building2 className="size-4 text-foreground" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{company.name}</p>
            {company.isPremium && (
              <PremiumBadge size="sm" className="mt-1.5" />
            )}
          </div>
        </div>
      </div>

      <nav className="flex flex-col gap-1 p-3">
        {COMPANY_NAV_ITEMS.map((item) => {
          const isActive = activeSegment === item.segment;
          const Icon = item.icon;
          const href = companyNavHref(company.id, item.segment);

          return (
            <Link
              key={item.segment}
              href={href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "sidebar-active-indicator bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId={`company-nav-${company.id}`}
                  className="absolute inset-0 rounded-lg bg-accent"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span
                className={cn(
                  "relative z-10 flex size-8 items-center justify-center rounded-md transition-all",
                  isActive
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground group-hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
              </span>
              <span className="relative z-10 truncate">{item.title}</span>
            </Link>
          );
        })}

        <div className="mt-4 border-t border-border pt-4">
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => setTransferOpen(true)}
          >
            <Coins className="size-4" />
            Transfer Credits
          </Button>
        </div>
      </nav>

      <TransferCreditsModal
        company={company}
        open={transferOpen}
        onOpenChange={setTransferOpen}
      />
    </aside>
  );
}
