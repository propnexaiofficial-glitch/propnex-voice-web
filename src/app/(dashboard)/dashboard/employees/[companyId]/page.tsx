import { redirect } from "next/navigation";

type CompanyIndexPageProps = {
  params: Promise<{ companyId: string }>;
};

export default async function CompanyIndexPage({ params }: CompanyIndexPageProps) {
  const { companyId } = await params;
  redirect(`/dashboard/employees/${companyId}/overview`);
}
