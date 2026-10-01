"use client";

import { useMemo, useState } from "react";
import { Search, Trash2, KeyRound } from "lucide-react";

import { useAdminPermissions, useDeletePermission } from "../hooks/use-permissions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreatePermissionDialog } from "./create-permission-dialog";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { LoadingState } from "@/components/feedback/loading-state";
import { ErrorState } from "@/components/feedback/error-state";
import { Can } from "@/features/auth/components/can";
import { Permission } from "../types/permission.types";
import { useToast } from "@/components/feedback/toast-system";

export function PermissionList() {
  const { data: permissions = [], isLoading, isError, error, refetch } = useAdminPermissions();
  const deletePermissionMutation = useDeletePermission();
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [deletingPermission, setDeletingPermission] = useState<Permission | null>(null);

  const filteredPermissions = useMemo(() => {
    if (!search.trim()) return permissions;
    const q = search.toLowerCase().trim();
    return permissions.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.code?.toLowerCase().includes(q) ||
        p.resource?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    );
  }, [permissions, search]);

  const handleDelete = () => {
    if (!deletingPermission) return;
    deletePermissionMutation.mutate(deletingPermission.id, {
      onSuccess: () => {
        toast.success("Permission deleted successfully");
        setDeletingPermission(null);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Failed to delete permission");
      },
    });
  };

  if (isLoading) return <LoadingState message="Loading system permissions..." />;
  if (isError) return <ErrorState message={error instanceof Error ? error.message : "Failed to load permissions."} onRetry={() => refetch()} />;

  return (
    <Can permission="PERMISSION_READ" fallback={<ErrorState title="Access Denied" message="You do not have permission to view system permissions." />}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Permissions Registry</h1>
            <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">
              System permission definitions and resource boundaries.
            </p>
          </div>

          <Can permission="PERMISSION_CREATE">
            <CreatePermissionDialog />
          </Can>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--muted-foreground))]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search permissions by name, code, or resource..."
              className="pl-9"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgb(var(--border))] bg-[rgb(var(--muted))]/50 text-left text-xs font-medium text-[rgb(var(--muted-foreground))]">
                <th className="px-5 py-3">Permission</th>
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Resource</th>
                <th className="px-5 py-3">Action</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--border))]">
              {filteredPermissions.map((permission) => (
                <tr key={permission.id} className="transition-colors hover:bg-[rgb(var(--muted))]/30">
                  <td className="px-5 py-4">
                    <div className="font-medium text-[rgb(var(--foreground))] flex items-center gap-2">
                      <KeyRound className="h-4 w-4 text-[rgb(var(--primary))]" />
                      {permission.name}
                    </div>
                    {permission.description && (
                      <div className="text-xs text-[rgb(var(--muted-foreground))] mt-0.5">
                        {permission.description}
                      </div>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <code className="text-xs bg-[rgb(var(--muted))] px-2 py-1 rounded font-mono font-semibold">
                      {permission.code || permission.name}
                    </code>
                  </td>

                  <td className="px-5 py-4">
                    <Badge variant="default">
                      {permission.resource || "GLOBAL"}
                    </Badge>
                  </td>

                  <td className="px-5 py-4 text-xs font-medium uppercase text-[rgb(var(--muted-foreground))]">
                    {permission.action || "EXECUTE"}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <Can permission="PERMISSION_DELETE">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingPermission(permission)}
                      >
                        <Trash2 className="h-4 w-4 text-[rgb(var(--danger))]" />
                      </Button>
                    </Can>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ConfirmDialog
          open={Boolean(deletingPermission)}
          onOpenChange={(open) => !open && setDeletingPermission(null)}
          title="Delete Permission"
          description={`Are you sure you want to delete permission "${deletingPermission?.name}"?`}
          confirmText="Delete"
          variant="danger"
          onConfirm={handleDelete}
        />
      </div>
    </Can>
  );
}
