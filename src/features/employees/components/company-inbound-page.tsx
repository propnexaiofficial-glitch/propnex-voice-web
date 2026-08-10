"use client";

import { CompanyCallsSection } from "@/features/employees/components/company-calls-section";

type CompanyInboundPageContentProps = {
  companyId: string;
};

export function CompanyInboundPageContent({
  companyId,
}: CompanyInboundPageContentProps) {
  return <CompanyCallsSection companyId={companyId} direction="inbound" />;
}
