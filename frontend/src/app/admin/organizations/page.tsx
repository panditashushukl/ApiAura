import { AppShell } from "@/components/layout/app-shell";
import { AdminNavTabs } from "@/features/admin/components/admin-nav-tabs";
import { OrganizationList } from "@/features/admin/organizations/components/organization-list";

export default function AdminOrganizationsPage() {
  return (
    <AppShell>
      <div className="p-6">
        <AdminNavTabs />
        <OrganizationList />
      </div>
    </AppShell>
  );
}
