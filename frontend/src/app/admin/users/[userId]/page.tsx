import { UserDetail } from "@/features/admin/users/components/user-detail";

interface AdminUserDetailPageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default async function AdminUserDetailPage({ params }: AdminUserDetailPageProps) {
  const { userId } = await params;
  return (
    <div className="p-6">
      <UserDetail userId={userId} />
    </div>
  );
}
