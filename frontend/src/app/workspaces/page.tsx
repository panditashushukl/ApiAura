import { AppShell } from "@/components/layout/app-shell";
import { WorkspaceList } from "@/features/workspace/components/workspace-list";

export default function WorkspacesPage() {
  return (
    <AppShell>
      <div className="p-6">
        <WorkspaceList />
      </div>
    </AppShell>
  );
}