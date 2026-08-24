"use client";



import Link from "next/link";

import { Building2, Lock, Trash2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { PremiumBadge } from "@/components/common/premium-badge";
import { Badge } from "@/components/ui/badge";
import type { SubCompany } from "@/features/employees/types";
import { cn } from "@/lib/utils";

type CompanyCardProps = {
  company: SubCompany;
  index?: number;
  className?: string;
};

export function CompanyCard({ company, index = 0, className }: CompanyCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const usagePercent = Math.round(
    (company.creditsUsed / company.creditsLimit) * 100
  );

  const isPending = company.status.toUpperCase() === "PENDING" || !company.contactPhone;
  const isLocked = company.creditsRemaining <= 0;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm(`Are you sure you want to delete ${company.name}? Credits will be returned to your main account.`)) {
      return;
    }

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/sub-companies/${company.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}` // if token based
        }
      });
      
      // Since fetch doesn't throw on 4xx/5xx, we handle it:
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete sub-company");
      }

      // Success, refresh the page to update the list and credit balances
      window.location.reload();
    } catch (error: any) {
      alert(error.message);
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={className}
    >
      <Link 
        href={`/dashboard/employees/${company.id}/overview`} 
        className={cn(
          "group flex h-full flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3.5 transition-all hover:border-foreground/20 hover:bg-accent/50",
          isPending && "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50",
          isLocked && "border-red-500/30 bg-red-500/5 hover:border-red-500/50 grayscale hover:grayscale-0 transition-all"
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",
            isLocked ? "bg-red-500/10 text-red-500" :
            isPending ? "bg-amber-500/10 text-amber-500" : "bg-muted text-foreground group-hover:bg-accent"
          )}>
            {isLocked || isPending ? <Lock className="size-4" /> : <Building2 className="size-4" />}
          </div>

          <div className="min-w-0 flex-1 flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <p className={cn("truncate text-sm font-semibold", isLocked && "text-red-500")}>{company.name}</p>
              {company.isPremium && <PremiumBadge size="sm" />}
            </div>
            <p className="text-[11px] text-muted-foreground truncate">
              Assigned Number <span className="opacity-50 mx-1">•</span> <span className="font-medium text-foreground">{company.contactPhone || "_____"}</span>
            </p>
            <p className="text-[11px] text-muted-foreground">
              Joined{" "}
              {new Date(company.joinedDate).toLocaleDateString("en-SG", {
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {company.creditsRemaining > 0 && company.creditsRemaining < 50 && (
              <Badge variant="destructive" className="animate-pulse bg-red-500/10 text-red-500 hover:bg-red-500/20 text-[10px]">
                Low Credit
              </Badge>
            )}
            <Badge
              variant={isLocked ? "destructive" : isPending ? "secondary" : company.status === "active" ? "success" : "secondary"}
              className={cn("text-[10px]", 
                isLocked ? "bg-red-500 text-white hover:bg-red-600" :
                isPending && "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
              )}
            >
              {isLocked ? "LOCKED (0 Credits)" : isPending ? "PENDING" : company.status}
            </Badge>
            
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="ml-1 flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50"
              title="Delete Sub-Company"
            >
              {isDeleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
            </button>
          </div>
        </div>

        <div className={cn("space-y-3", isLocked && "opacity-60")}>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Credits Allocated: {company.creditsLimit.toLocaleString()}</span>
              <span className="font-medium tabular-nums">
                {usagePercent}% Used
              </span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground transition-all"
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex flex-col">
              <span className="text-muted-foreground">Inbound Calls</span>
              <span className="font-semibold text-foreground">{company.inboundCalls.toLocaleString()}</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-muted-foreground">Outbound Calls</span>
              <span className="font-semibold text-foreground">{company.outboundCalls.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>

  );

}

