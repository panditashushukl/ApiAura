"use client";

import { useMemo, useState } from "react";
import { Search, Shield, Check } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useRolePermissions, useToggleRolePermission } from "../hooks/use-roles";
import { useAdminPermissions } from "@/features/admin/permissions/hooks/use-permissions";
import { Role } from "../types/role.types";
import { LoadingState } from "@/components/feedback/loading-state";
import { useToast } from "@/components/feedback/toast-system";

interface RolePermissionsDialogProps {
  role: Role | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RolePermissionsDialog({ role, open, onOpenChange }: RolePermissionsDialogProps) {
  const roleId = role?.id ?? "";
  const { data: rolePermissions = [], isLoading: isRolePermsLoading } = useRolePermissions(roleId);
  const { data: allPermissions = [], isLoading: isAllPermsLoading } = useAdminPermissions();
  const togglePermission = useToggleRolePermission();
  const toast = useToast();

  const [search, setSearch] = useState("");

  const grantedMap = useMemo(() => {
    const set = new Set<string>();
    rolePermissions.forEach((p) => set.add(p.id));
    return set;
  }, [rolePermissions]);

  const filteredPermissions = useMemo(() => {
    if (!search.trim()) return allPermissions;
    const q = search.toLowerCase().trim();
    return allPermissions.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.code?.toLowerCase().includes(q) ||
        p.resource?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    );
  }, [allPermissions, search]);

  const handleToggle = (permissionId: string, currentGranted: boolean) => {
    if (!roleId) return;
    togglePermission.mutate(
      { roleId, permissionId, grant: !currentGranted },
      {
        onSuccess: () => {
          toast.success(currentGranted ? "Permission revoked" : "Permission granted");
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Failed to toggle permission");
        },
      }
    );
  };

  if (!role) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[rgb(var(--primary))]" />
            Manage Permissions: <span className="font-semibold text-[rgb(var(--primary))]">{role.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="py-2 space-y-3 flex-1 overflow-hidden flex flex-col">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--muted-foreground))]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search permissions by name, code, or resource..."
              className="pl-9"
            />
          </div>

          {isRolePermsLoading || isAllPermsLoading ? (
            <LoadingState message="Loading permissions matrix..." />
          ) : (
            <div className="overflow-y-auto flex-1 divide-y divide-[rgb(var(--border))] border border-[rgb(var(--border))] rounded-lg p-2 max-h-[400px]">
              {filteredPermissions.length === 0 ? (
                <div className="p-6 text-center text-sm text-[rgb(var(--muted-foreground))]">
                  No permissions matching search criteria.
                </div>
              ) : (
                filteredPermissions.map((permission) => {
                  const isGranted = grantedMap.has(permission.id);
                  return (
                    <div
                      key={permission.id}
                      onClick={() => handleToggle(permission.id, isGranted)}
                      className="flex items-center justify-between p-3 hover:bg-[rgb(var(--muted))]/40 rounded-md cursor-pointer transition-colors"
                    >
                      <div className="space-y-1 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-[rgb(var(--foreground))]">
                            {permission.name}
                          </span>
                          {permission.resource && (
                            <Badge variant="default">
                              {permission.resource}
                            </Badge>
                          )}
                        </div>
                        {permission.description && (
                          <p className="text-xs text-[rgb(var(--muted-foreground))]">
                            {permission.description}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        className={`h-6 w-6 rounded border flex items-center justify-center transition-colors ${
                          isGranted
                            ? "bg-[rgb(var(--primary))] border-[rgb(var(--primary))] text-white"
                            : "border-[rgb(var(--border))] bg-[rgb(var(--card))]"
                        }`}
                      >
                        {isGranted && <Check className="h-4 w-4" />}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
