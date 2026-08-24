"use client";

import { useState, useEffect } from "react";
import { Building2, Mail, Phone, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

import { PremiumBadge } from "@/components/common/premium-badge";
import { Badge } from "@/components/ui/badge";
import { CallPreviewPanel } from "@/features/employees/components/call-preview-panel";
import { TransferCreditsModal } from "@/features/employees/components/transfer-credits-modal";
import type { CallPreview, SubCompany } from "@/features/employees/types";
import { useInboundCallsApi } from "@/features/inbound/hooks/use-inbound-calls-api";
import { DEFAULT_CALL_FILTERS } from "@/types/call";
import { cn } from "@/lib/utils";

type CompanyOverviewSectionProps = {
  company: SubCompany;
  previewCalls?: CallPreview[];
};

export function CompanyOverviewSection({
  company,
}: CompanyOverviewSectionProps) {
  const [transferOpen, setTransferOpen] = useState(false);
  const { calls: inboundCallsRaw } = useInboundCallsApi(DEFAULT_CALL_FILTERS, 1, 0, true, company.id, "inbound");
  const { calls: outboundCallsRaw } = useInboundCallsApi(DEFAULT_CALL_FILTERS, 1, 0, true, company.id, "outbound");

  const [stats, setStats] = useState({
    creditsUsed: company.creditsUsed,
    inboundCalls: company.inboundCalls,
    outboundCalls: company.outboundCalls,
    creditsTrend: 0,
    inboundTrend: 0,
    outboundTrend: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const token = localStorage.getItem("accessToken") || localStorage.getItem("access_token");
        if (!token) return;
        const res = await fetch(`/api/users/dashboard-stats?companyId=${company.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats({
            creditsUsed: data.creditsUsed !== undefined ? data.creditsUsed : company.creditsUsed,
            inboundCalls: data.inboundCalls !== undefined ? data.inboundCalls : company.inboundCalls,
            outboundCalls: data.outboundCalls !== undefined ? data.outboundCalls : company.outboundCalls,
            creditsTrend: data.creditsTrend || 0,
            inboundTrend: data.inboundTrend || 0,
            outboundTrend: data.outboundTrend || 0,
          });
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadStats();
  }, [company.id, company.creditsUsed, company.inboundCalls, company.outboundCalls]);

  const usagePercent = Math.round(
    (company.creditsUsed / company.creditsLimit) * 100
  );

  const inboundPreviews: CallPreview[] = inboundCallsRaw.slice(0, 5).map(c => ({
    id: c.id,
    customerNumber: c.customerNumber,
    date: new Date(c.callDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    duration: c.duration,
    status: c.status as any,
    direction: "inbound"
  }));

  const outboundPreviews: CallPreview[] = outboundCallsRaw.slice(0, 5).map(c => ({
    id: c.id,
    customerNumber: c.customerNumber,
    date: new Date(c.callDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    duration: c.duration,
    status: c.status as any,
    direction: "outbound"
  }));

  const realPreviewCalls = [...inboundPreviews, ...outboundPreviews];

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <ArrowUpRight className="size-3 text-emerald-500" />;
    if (trend < 0) return <ArrowDownRight className="size-3 text-destructive" />;
    return <Minus className="size-3 text-muted-foreground" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return "text-emerald-500";
    if (trend < 0) return "text-destructive";
    return "text-muted-foreground";
  };

  return (
    <div className="space-y-4">
      <div className="glass-card rounded-xl p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted">
              <Building2 className="size-5 text-foreground" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold">{company.name}</h2>
                {company.isPremium && <PremiumBadge size="sm" />}
                <Badge
                  variant={company.creditsRemaining <= 0 ? "destructive" : company.status === "active" ? "success" : "secondary"}
                  className={cn("text-[10px]", company.creditsRemaining <= 0 && "bg-red-500 text-white")}
                >
                  {company.creditsRemaining <= 0 ? "LOCKED" : company.status}
                </Badge>
                {(company.creditsRemaining ?? company.creditsLimit ?? 0) > 0 && (company.creditsRemaining ?? company.creditsLimit ?? 0) < 50 && (
                  <Badge variant="destructive" className="text-[10px] uppercase font-bold animate-pulse">
                    Low Credit
                  </Badge>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-muted-foreground font-medium">Assigned Numbers</span>
                {(company.assignedNumbers?.length ? company.assignedNumbers : company.contactPhone ? [company.contactPhone] : []).length === 0 ? (
                  <span className="text-xs text-amber-500">Pending Assignment...</span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {(company.assignedNumbers?.length ? company.assignedNumbers : [company.contactPhone]).filter(Boolean).map((num, i) => {
                      const last3 = (num as string).replace(/\s/g, "").slice(-3);
                      return (
                        <span
                          key={i}
                          title={num as string}
                          className="group inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-mono cursor-default"
                        >
                          <span className="group-hover:hidden">•••{last3}</span>
                          <span className="hidden group-hover:inline text-primary">{num}</span>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="shrink-0 text-right text-xs text-muted-foreground">
            <p>Credits usage</p>
            <p className="mt-0.5 text-sm font-semibold text-foreground">
              {company.creditsUsed.toLocaleString()}
              <span className="font-normal text-muted-foreground">
                {" "}
                / {company.creditsLimit.toLocaleString()}
              </span>
            </p>
            <p className="mt-0.5 text-muted-foreground">{usagePercent}% used</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            {
              label: "Credits Used",
              value: stats.creditsUsed.toLocaleString(),
              accent: "text-foreground",
              change: stats.creditsTrend > 0 ? `+${stats.creditsTrend}%` : `${stats.creditsTrend}%`,
              trendValue: stats.creditsTrend,
              changeLabel: "vs last month",
            },
            {
              label: "Inbound Calls",
              value: stats.inboundCalls.toLocaleString(),
              accent: "",
              change: stats.inboundTrend > 0 ? `+${stats.inboundTrend}%` : `${stats.inboundTrend}%`,
              trendValue: stats.inboundTrend,
              changeLabel: "vs last month",
            },
            {
              label: "Outbound Calls",
              value: stats.outboundCalls.toLocaleString(),
              accent: "",
              change: stats.outboundTrend > 0 ? `+${stats.outboundTrend}%` : `${stats.outboundTrend}%`,
              trendValue: stats.outboundTrend,
              changeLabel: "vs last month",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-muted px-3 py-3 text-center"
            >
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </p>
              <p className={cn("mt-1 text-xl font-bold tabular-nums", stat.accent)}>
                {stat.value}
              </p>
              <div className="mt-2 flex items-center justify-center gap-1 text-[10px]">
                {getTrendIcon(stat.trendValue)}
                <span className={cn("font-medium", getTrendColor(stat.trendValue))}>
                  {stat.change}
                </span>
                <span className="text-muted-foreground">{stat.changeLabel}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <CallPreviewPanel 
          calls={inboundPreviews} 
          direction="inbound" 
          isLocked={company.creditsRemaining <= 0 ? "Locked (0 Credits)" : !(company.contactPhone || company.assignedNumbers?.length)} 
          onAddCredits={company.creditsRemaining <= 0 ? () => setTransferOpen(true) : undefined}
        />
        <CallPreviewPanel 
          calls={outboundPreviews} 
          direction="outbound" 
          isLocked={company.creditsRemaining <= 0 ? "Locked (0 Credits)" : !(company.contactPhone || company.assignedNumbers?.length)} 
          onAddCredits={company.creditsRemaining <= 0 ? () => setTransferOpen(true) : undefined}
        />
      </div>

      <TransferCreditsModal
        company={company}
        open={transferOpen}
        onOpenChange={setTransferOpen}
      />
    </div>
  );
}
