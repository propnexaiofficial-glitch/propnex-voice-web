import { CompanyInboundPageContent } from "@/features/employees/components/company-inbound-page";

type CompanyInboundPageProps = {
  params: Promise<{ companyId: string }>;
};

export default async function CompanyInboundPage({
  params,
}: CompanyInboundPageProps) {
  const { companyId } = await params;
  return <CompanyInboundPageContent companyId={companyId} />;
}
