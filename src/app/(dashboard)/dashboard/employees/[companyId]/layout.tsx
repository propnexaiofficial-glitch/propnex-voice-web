import { CompanyLayoutClient } from "@/features/employees/components/company-layout-client";

type CompanyLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ companyId: string }>;
};

export default async function CompanyLayout({
  children,
  params,
}: CompanyLayoutProps) {
  const { companyId } = await params;

  return (
    <CompanyLayoutClient companyId={companyId}>{children}</CompanyLayoutClient>
  );
}
