"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Building2, Edit, Trash2, Eye } from "lucide-react";

import { useOrganizations } from "../hooks/use-organizations";
import { useDeleteOrganization } from "../hooks/use-delete-organization";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreateOrganizationDialog } from "./create-organization-dialog";
import { EditOrganizationDialog } from "./edit-organization-dialog";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { LoadingState } from "@/components/feedback/loading-state";
import { ErrorState } from "@/components/feedback/error-state";
import { Can } from "@/features/auth/components/can";
import { Organization } from "../types/organization.types";
import { useToast } from "@/components/feedback/toast-system";

export function OrganizationList() {
  const { data: organizations = [], isLoading, isError, error, refetch } = useOrganizations();
  const deleteOrgMutation = useDeleteOrganization();
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [deletingOrg, setDeletingOrg] = useState<Organization | null>(null);

  const filteredOrgs = useMemo(() => {
    if (!search.trim()) return organizations;
    const q = search.toLowerCase().trim();
    return organizations.filter(
      (org) =>
        org.name.toLowerCase().includes(q) ||
        org.slug.toLowerCase().includes(q)
    );
  }, [organizations, search]);

  const handleDelete = () => {
    if (!deletingOrg) return;
    deleteOrgMutation.mutate(deletingOrg.id, {
      onSuccess: () => {
        toast.success("Organization deleted successfully");
        setDeletingOrg(null);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Failed to delete organization");
      },
    });
  };

  if (isLoading) return <LoadingState message="Loading organizations..." />;
  if (isError) return <ErrorState message={error instanceof Error ? error.message : "Failed to load organizations."} onRetry={() => refetch()} />;

  return (
    <Can permission="ORG_READ" fallback={<ErrorState title="Access Denied" message="You do not have permission to view organizations." />}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Organization Management</h1>
            <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">
              Manage multi-tenant organizations and associated workspace scopes.
            </p>
          </div>

          <Can permission="ORG_CREATE">
            <CreateOrganizationDialog />
          </Can>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--muted-foreground))]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search organizations by name or slug..."
              className="pl-9"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredOrgs.map((org) => (
            <Card key={org.id} className="flex flex-col justify-between hover:border-[rgb(var(--primary))]/40 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-[rgb(var(--primary))]" />
                    {org.name}
                  </CardTitle>
                </div>
                <CardDescription className="text-xs font-mono">
                  slug: {org.slug}
                </CardDescription>
              </CardHeader>

              <CardFooter className="pt-3 border-t border-[rgb(var(--border))] flex justify-between gap-2">
                <Link href={`/admin/organizations/${org.id}`}>
                  <Button variant="secondary" size="sm" className="gap-1 text-xs">
                    <Eye className="h-3.5 w-3.5" />
                    View Details
                  </Button>
                </Link>

                <div className="flex items-center gap-1">
                  <Can permission="ORG_UPDATE">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingOrg(org)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Can>

                  <Can permission="ORG_DELETE">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingOrg(org)}
                    >
                      <Trash2 className="h-4 w-4 text-[rgb(var(--danger))]" />
                    </Button>
                  </Can>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        <EditOrganizationDialog
          organization={editingOrg}
          open={Boolean(editingOrg)}
          onOpenChange={(open) => !open && setEditingOrg(null)}
        />

        <ConfirmDialog
          open={Boolean(deletingOrg)}
          onOpenChange={(open) => !open && setDeletingOrg(null)}
          title="Delete Organization"
          description={`Are you sure you want to delete organization "${deletingOrg?.name}"? All associated workspaces and data will be affected.`}
          confirmText="Delete Organization"
          variant="danger"
          onConfirm={handleDelete}
        />
      </div>
    </Can>
  );
}
