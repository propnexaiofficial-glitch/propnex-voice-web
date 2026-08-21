"use client";

import { Building2, Mail, Phone, ArrowUpRight } from "lucide-react";

import { PremiumBadge } from "@/components/common/premium-badge";
import { Badge } from "@/components/ui/badge";
import { CallPreviewPanel } from "@/features/employees/components/call-preview-panel";
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
  const { calls: inboundCallsRaw } = useInboundCallsApi(DEFAULT_CALL_FILTERS, 1, 0, true, company.id, "inbound");
  const { calls: outboundCallsRaw } = useInboundCallsApi(DEFAULT_CALL_FILTERS, 1, 0, true, company.id, "outbound");

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
                  variant={company.status === "active" ? "success" : "secondary"}
                  className="text-[10px]"
                >
                  {company.status}
                </Badge>
              </div>
              <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="size-3 shrink-0" />
                  {company.contactPhone || "Pending Assignment..."}
                </span>
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
              value: company.creditsUsed.toLocaleString(),
              accent: "text-foreground",
              change: "+100%",
              changeLabel: "vs last month",
            },
            {
              label: "Inbound Calls",
              value: company.inboundCalls.toLocaleString(),
              accent: "",
              change: "+0%",
              changeLabel: "vs last month",
            },
            {
              label: "Outbound Calls",
              value: company.outboundCalls.toLocaleString(),
              accent: "",
              change: "+0%",
              changeLabel: "new this week",
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
                <ArrowUpRight className="size-3 text-emerald-500" />
                <span className="font-medium text-emerald-500">
                  {stat.change}
                </span>
                <span className="text-muted-foreground">{stat.changeLabel}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <CallPreviewPanel calls={realPreviewCalls} direction="inbound" isLocked={!company.contactPhone} />
        <CallPreviewPanel calls={realPreviewCalls} direction="outbound" isLocked={!company.contactPhone} />
      </div>
    </div>
  );
}
