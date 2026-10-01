"use client";

import { useMemo, useState } from "react";
import { Search, Edit, Shield, Trash2, Key } from "lucide-react";

import { useRoles, useDeleteRole } from "../hooks/use-roles";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreateRoleDialog } from "./create-role-dialog";
import { EditRoleDialog } from "./edit-role-dialog";
import { RolePermissionsDialog } from "./role-permissions-dialog";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { LoadingState } from "@/components/feedback/loading-state";
import { ErrorState } from "@/components/feedback/error-state";
import { Can } from "@/features/auth/components/can";
import { Role } from "../types/role.types";
import { useToast } from "@/components/feedback/toast-system";

export function RoleList() {
  const { data: roles = [], isLoading, isError, error, refetch } = useRoles();
  const deleteRoleMutation = useDeleteRole();
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [permissionsRole, setPermissionsRole] = useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);

  const filteredRoles = useMemo(() => {
    if (!search.trim()) return roles;
    const q = search.toLowerCase().trim();
    return roles.filter(
      (role) =>
        role.name.toLowerCase().includes(q) ||
        role.description?.toLowerCase().includes(q)
    );
  }, [roles, search]);

  const handleDelete = () => {
    if (!deletingRole) return;
    deleteRoleMutation.mutate(deletingRole.id, {
      onSuccess: () => {
        toast.success("Role deleted successfully");
        setDeletingRole(null);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Failed to delete role");
      },
    });
  };

  if (isLoading) return <LoadingState message="Loading roles..." />;
  if (isError) return <ErrorState message={error instanceof Error ? error.message : "Failed to load roles."} onRetry={() => refetch()} />;

  return (
    <Can permission="ROLE_READ" fallback={<ErrorState title="Access Denied" message="You do not have permission to view roles." />}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Role Management</h1>
            <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">
              Configure access roles and assign system permission sets.
            </p>
          </div>

          <Can permission="ROLE_CREATE">
            <CreateRoleDialog />
          </Can>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--muted-foreground))]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search roles..."
              className="pl-9"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRoles.map((role) => (
            <Card key={role.id} className="flex flex-col justify-between hover:border-[rgb(var(--primary))]/40 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Shield className="h-4 w-4 text-[rgb(var(--primary))]" />
                    {role.name}
                  </CardTitle>
                </div>
                <CardDescription className="line-clamp-2 text-xs">
                  {role.description || "No description provided."}
                </CardDescription>
              </CardHeader>

              <CardFooter className="pt-3 border-t border-[rgb(var(--border))] flex justify-between gap-2">
                <Can permission="ROLE_UPDATE">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-1 text-xs"
                    onClick={() => setPermissionsRole(role)}
                  >
                    <Key className="h-3.5 w-3.5" />
                    Permissions
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingRole(role)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </Can>

                <Can permission="ROLE_DELETE">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingRole(role)}
                  >
                    <Trash2 className="h-4 w-4 text-[rgb(var(--danger))]" />
                  </Button>
                </Can>
              </CardFooter>
            </Card>
          ))}
        </div>

        <EditRoleDialog
          role={editingRole}
          open={Boolean(editingRole)}
          onOpenChange={(open) => !open && setEditingRole(null)}
        />

        <RolePermissionsDialog
          role={permissionsRole}
          open={Boolean(permissionsRole)}
          onOpenChange={(open) => !open && setPermissionsRole(null)}
        />

        <ConfirmDialog
          open={Boolean(deletingRole)}
          onOpenChange={(open) => !open && setDeletingRole(null)}
          title="Delete Role"
          description={`Are you sure you want to delete role "${deletingRole?.name}"?`}
          confirmText="Delete Role"
          variant="danger"
          onConfirm={handleDelete}
        />
      </div>
    </Can>
  );
}
