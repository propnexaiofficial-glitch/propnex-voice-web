"use client";



import Link from "next/link";

import { Building2, Lock, Trash2, Loader2, PhoneIncoming, PhoneOutgoing } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { PremiumBadge } from "@/components/common/premium-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const usagePercent = Math.round(
    (company.creditsUsed / company.creditsLimit) * 100
  );

  const isPending = company.status.toUpperCase() === "PENDING";
  const isLocked = company.creditsRemaining <= 0;
  const allNumbers = company.assignedNumbers?.length
    ? company.assignedNumbers
    : company.contactPhone
    ? [{ number: company.contactPhone }]
    : [];
  const hasNumbers = allNumbers.length > 0;

  const inboundNumbers = allNumbers.filter(n => n.direction !== "OUTBOUND").map(n => n.number);
  const outboundNumbers = allNumbers.filter(n => n.direction === "OUTBOUND").map(n => n.number);
  const channels = company.channels || 0;

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteError(null);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    try {
      setIsDeleting(true);
      setDeleteError(null);
      const token = localStorage.getItem("accessToken") || localStorage.getItem("access_token");
      const res = await fetch(`/api/sub-companies/${company.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete sub-company");
      }

      window.location.reload();
    } catch (error: any) {
      setDeleteError(error.message || "An unexpected error occurred");
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
            <div className="flex flex-col gap-0.5">
              <p className="text-[11px] text-muted-foreground truncate">
                Assigned Numbers{" "}
                <span className="opacity-50 mx-1">•</span>
                {!hasNumbers ? (
                  <span className="font-medium text-amber-500">Pending...</span>
                ) : (
                  <TooltipProvider>
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center justify-center size-5 rounded bg-muted/50 hover:bg-muted transition-colors cursor-default" onClick={(e) => e.preventDefault()}>
                            <PhoneIncoming className="size-3 text-blue-500" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="flex flex-col gap-1.5 p-3" onClick={(e) => e.preventDefault()}>
                          <p className="font-semibold text-xs border-b border-border pb-1">Inbound Info</p>
                          <div className="text-xs">
                            <span className="text-muted-foreground">Numbers: </span>
                            {inboundNumbers.length > 0 ? inboundNumbers.join(", ") : "None"}
                          </div>
                          <div className="text-xs">
                            <span className="text-muted-foreground">Channels: </span>
                            {channels}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center justify-center size-5 rounded bg-muted/50 hover:bg-muted transition-colors cursor-default" onClick={(e) => e.preventDefault()}>
                            <PhoneOutgoing className="size-3 text-orange-500" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="flex flex-col gap-1.5 p-3" onClick={(e) => e.preventDefault()}>
                          <p className="font-semibold text-xs border-b border-border pb-1">Outbound Info</p>
                          <div className="text-xs">
                            <span className="text-muted-foreground">Numbers: </span>
                            {outboundNumbers.length > 0 ? outboundNumbers.join(", ") : "None"}
                          </div>
                          <div className="text-xs">
                            <span className="text-muted-foreground">Channels: </span>
                            {channels}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                )}
              </p>
            </div>
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
              variant={isLocked ? "destructive" : isPending ? "secondary" : company.status?.toUpperCase() === "ACTIVE" ? "success" : "secondary"}
              className={cn("text-[10px]", 
                isLocked ? "bg-red-500 text-white hover:bg-red-600" :
                isPending ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20" :
                company.status?.toUpperCase() === "ACTIVE" ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" : ""
              )}
            >
              {isLocked ? "LOCKED (0 Credits)" : isPending ? "PENDING" : company.status}
            </Badge>
            
            <button
              onClick={handleDeleteClick}
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

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()} className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Sub-Company</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{company.name}</strong>? 
              Credits will be returned to your main account, and call logs will be preserved. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <p className="text-sm font-medium text-destructive">{deleteError}</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting} className="hover:bg-accent hover:text-accent-foreground transition-colors">
              Cancel
            </Button>
            <Button variant="default" onClick={executeDelete} disabled={isDeleting} className="bg-red-500 hover:bg-red-600 text-white transition-colors">
              {isDeleting ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Trash2 className="mr-2 size-4" />}
              Delete Sub-Company
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>

  );

}

