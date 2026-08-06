"use client";

import { CompanyCallsSection } from "@/features/employees/components/company-calls-section";

type CompanyOutboundPageContentProps = {
  companyId: string;
};

export function CompanyOutboundPageContent({
  companyId,
}: CompanyOutboundPageContentProps) {
  return <CompanyCallsSection companyId={companyId} direction="outbound" />;
}
