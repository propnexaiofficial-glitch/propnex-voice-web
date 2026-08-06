import { CompanyOverviewPageContent } from "@/features/employees/components/company-overview-page";

type CompanyOverviewPageProps = {
  params: Promise<{ companyId: string }>;
};

export default async function CompanyOverviewPage({
  params,
}: CompanyOverviewPageProps) {
  const { companyId } = await params;
  return <CompanyOverviewPageContent companyId={companyId} />;
}
