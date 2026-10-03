import { AppShell } from "@/components/layout/app-shell";
import { AdminNavTabs } from "@/features/admin/components/admin-nav-tabs";
import { PermissionList } from "@/features/admin/permissions/components/permission-list";

export default function AdminPermissionsPage() {
    return (
        <AppShell>
            <div className="p-6">
                <AdminNavTabs />
                <PermissionList />
            </div>
        </AppShell>
    );
}
