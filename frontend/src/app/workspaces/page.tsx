"use client";

import { useOrganizations } from "@/features/admin/organizations/hooks/use-organizations";
import { useOrganizationStore } from "@/stores/organization.store";
import { WorkspaceSelector } from "@/features/workspace/components/workspace-selector";
import { CreateWorkspaceDialog } from "@/features/workspace/components/create-workspace-dialog";
import { LoadingState } from "@/components/feedback/loading-state";

export default function WorkspacesPage() {
  const { data: organizations = [], isLoading } = useOrganizations();
  const { selectedOrganizationId, setSelectedOrganizationId } = useOrganizationStore();

  const activeOrgId =
    selectedOrganizationId ||
    (organizations.length > 0 ? organizations[0].id : null);

  if (isLoading) return <LoadingState message="Loading workspaces..." />;


  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Workspaces</h1>
          <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">
            Switch and manage your active ApiAura workspaces.
          </p>
        </div>

        {activeOrgId && <CreateWorkspaceDialog organizationId={activeOrgId} />}
      </div>

      {organizations.length > 1 && (
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-[rgb(var(--muted-foreground))]">Organization Scope:</span>
          <select
            value={activeOrgId || ""}
            onChange={(e) => setSelectedOrganizationId(e.target.value)}
            className="h-9 rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]"
          >
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name} ({org.slug})
              </option>
            ))}
          </select>
        </div>
      )}

      <WorkspaceSelector />
    </main>
  );
}