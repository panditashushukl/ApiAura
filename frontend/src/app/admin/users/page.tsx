import { AppShell } from "@/components/layout/app-shell";
import { AdminNavTabs } from "@/features/admin/components/admin-nav-tabs";
import { UserList } from "@/features/admin/users/components/user-list";

export default function AdminUsersPage() {
    return (
        <AppShell>
            <div className="p-6">
                <AdminNavTabs />
                <UserList />
            </div>
        </AppShell>
    );
}