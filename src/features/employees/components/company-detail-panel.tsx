"use client";

import { Building2, Mail, Phone } from "lucide-react";

import { PremiumBadge } from "@/components/common/premium-badge";
import { Badge } from "@/components/ui/badge";
import { CallPreviewPanel } from "@/features/employees/components/call-preview-panel";
import type { CallPreview, SubCompany } from "@/features/employees/types";
import { cn } from "@/lib/utils";

type CompanyDetailPanelProps = {
  company: SubCompany;
  previewCalls: CallPreview[];
};

export function CompanyDetailPanel({
  company,
  previewCalls,
}: CompanyDetailPanelProps) {
  const usagePercent = Math.round(
    (company.creditsUsed / company.creditsLimit) * 100
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="glass-card rounded-2xl p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div
              className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted"
            >
              <Building2 className="size-5 text-foreground" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold">{company.name}</h3>
                {company.isPremium && <PremiumBadge size="sm" />}
                <Badge
                  variant={company.status === "active" ? "success" : "secondary"}
                  className="text-[10px]"
                >
                  {company.status}
                </Badge>
              </div>
              <div className="mt-2 flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:items-center sm:gap-4">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="size-3 shrink-0" />
                  {company.contactEmail}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="size-3 shrink-0" />
                  {company.contactPhone}
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

        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            { label: "Credits Used", value: company.creditsUsed.toLocaleString(), accent: "text-foreground" },
            { label: "Inbound Calls", value: company.inboundCalls.toLocaleString(), accent: "" },
            { label: "Outbound Calls", value: company.outboundCalls.toLocaleString(), accent: "" },
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
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <CallPreviewPanel calls={previewCalls} direction="inbound" />
        <CallPreviewPanel calls={previewCalls} direction="outbound" />
      </div>
    </div>
  );
}
