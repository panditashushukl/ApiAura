import { useAuthStore } from "@/stores/auth.store";
import { useCallback } from "react";

export function usePermissions() {
  const permissions = useAuthStore((state) => state.permissions);
  const roles = useAuthStore((state) => state.roles);

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!permission) return true;
      if (permissions.includes("*") || permissions.includes("ALL")) return true;
      return permissions.includes(permission);
    },
    [permissions]
  );

  const hasAnyPermission = useCallback(
    (requiredPermissions: string[]): boolean => {
      if (!requiredPermissions || requiredPermissions.length === 0) return true;
      if (permissions.includes("*") || permissions.includes("ALL")) return true;
      return requiredPermissions.some((p) => permissions.includes(p));
    },
    [permissions]
  );

  const hasAllPermissions = useCallback(
    (requiredPermissions: string[]): boolean => {
      if (!requiredPermissions || requiredPermissions.length === 0) return true;
      if (permissions.includes("*") || permissions.includes("ALL")) return true;
      return requiredPermissions.every((p) => permissions.includes(p));
    },
    [permissions]
  );

  const hasRole = useCallback(
    (roleName: string): boolean => {
      return roles.includes(roleName);
    },
    [roles]
  );

  return {
    permissions,
    roles,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
  };
}
