import { CompanyOutboundPageContent } from "@/features/employees/components/company-outbound-page";

type CompanyOutboundPageProps = {
  params: Promise<{ companyId: string }>;
};

export default async function CompanyOutboundPage({
  params,
}: CompanyOutboundPageProps) {
  const { companyId } = await params;
  return <CompanyOutboundPageContent companyId={companyId} />;
}
