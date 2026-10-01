"use client";

import Link from "next/link";
import { ArrowLeft, Building2, Calendar, Layers, Edit } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useOrganization } from "../hooks/use-organization";
import { getWorkspacesByOrganization } from "@/features/workspace/api/workspace.api";
import { queryKeys } from "@/lib/query/query-keys";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EditOrganizationDialog } from "./edit-organization-dialog";
import { CreateWorkspaceDialog } from "@/features/workspace/components/create-workspace-dialog";
import { LoadingState } from "@/components/feedback/loading-state";
import { ErrorState } from "@/components/feedback/error-state";
import { EmptyState } from "@/components/feedback/empty-state";
import { Can } from "@/features/auth/components/can";

interface OrganizationDetailProps {
  organizationId: string;
}

export function OrganizationDetail({ organizationId }: OrganizationDetailProps) {
  const { data: organization, isLoading, isError, error, refetch } = useOrganization(organizationId);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { data: workspaces = [], isLoading: isWorkspacesLoading } = useQuery({
    queryKey: queryKeys.workspaces.byOrg(organizationId),
    queryFn: () => getWorkspacesByOrganization(organizationId),
    enabled: Boolean(organizationId),
  });

  if (isLoading) return <LoadingState message="Loading organization details..." />;
  if (isError || !organization) return <ErrorState message={error instanceof Error ? error.message : "Organization not found."} onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/organizations">
            <Button variant="secondary" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{organization.name}</h1>
            <p className="text-sm font-mono text-[rgb(var(--muted-foreground))]">slug: {organization.slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Can permission="ORG_UPDATE">
            <Button variant="secondary" className="gap-2" onClick={() => setIsEditOpen(true)}>
              <Edit className="h-4 w-4" />
              Edit Organization
            </Button>
          </Can>
          <CreateWorkspaceDialog organizationId={organization.id} />
        </div>
      </div>

      {/* Overview Card */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Organization Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between border-b border-[rgb(var(--border))] pb-3">
              <span className="text-[rgb(var(--muted-foreground))] flex items-center gap-2">
                <Building2 className="h-4 w-4" /> ID
              </span>
              <span className="font-mono text-xs">{organization.id}</span>
            </div>

            <div className="flex items-center justify-between border-b border-[rgb(var(--border))] pb-3">
              <span className="text-[rgb(var(--muted-foreground))] flex items-center gap-2">
                <Layers className="h-4 w-4" /> Workspaces Count
              </span>
              <span className="font-semibold">{workspaces.length}</span>
            </div>

            <div className="flex items-center justify-between pb-1">
              <span className="text-[rgb(var(--muted-foreground))] flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Created On
              </span>
              <span>{new Date(organization.createdAt).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Workspaces List */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Associated Workspaces</CardTitle>
              <CardDescription>Workspaces belonging to {organization.name}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {isWorkspacesLoading ? (
              <LoadingState message="Loading workspaces..." />
            ) : workspaces.length === 0 ? (
              <EmptyState
                title="No Workspaces Yet"
                description="Create the first workspace in this organization to start building APIs."
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {workspaces.map((ws) => (
                  <div
                    key={ws.id}
                    className="p-4 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] space-y-2 hover:border-[rgb(var(--primary))]/40 transition-colors"
                  >
                    <div className="font-semibold text-sm flex items-center justify-between">
                      {ws.name}
                      <span className="text-[10px] font-mono bg-[rgb(var(--muted))] px-2 py-0.5 rounded">
                        {ws.status}
                      </span>
                    </div>
                    {ws.description && (
                      <p className="text-xs text-[rgb(var(--muted-foreground))] line-clamp-2">
                        {ws.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <EditOrganizationDialog
        organization={organization}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </div>
  );
}
