import { OrganizationDetail } from "@/features/admin/organizations/components/organization-detail";

interface AdminOrgDetailPageProps {
  params: Promise<{
    organizationId: string;
  }>;
}

export default async function AdminOrgDetailPage({ params }: AdminOrgDetailPageProps) {
  const { organizationId } = await params;
  return (
    <div className="p-6">
      <OrganizationDetail organizationId={organizationId} />
    </div>
  );
}
