import { AppShell } from "@/components/layout/app-shell";
import { AdminNavTabs } from "@/features/admin/components/admin-nav-tabs";
import { RoleList } from "@/features/admin/roles/components/role-list";

export default function AdminRolesPage() {
    return (
        <AppShell>
            <div className="p-6">
                <AdminNavTabs />
                <RoleList />
            </div>
        </AppShell>
    );
}
