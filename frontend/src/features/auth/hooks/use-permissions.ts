import { useAuthStore } from "@/stores/auth.store";
import { useCallback } from "react";

export function usePermissions() {
  const permissions = useAuthStore((state) => state.permissions) ?? [];
  const roles = useAuthStore((state) => state.roles) ?? [];
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const isSuperAdmin =
    isAuthenticated &&
    roles.some((r) =>
      ["SUPER_ADMIN", "ROLE_SUPER_ADMIN"].includes(r.toUpperCase())
    );

  const isOrgAdmin =
    isAuthenticated &&
    roles.some((r) =>
      ["ADMIN", "ROLE_ADMIN"].includes(r.toUpperCase())
    );

  const isGuest =
    !isAuthenticated ||
    roles.length === 0 ||
    roles.every((r) => r.toUpperCase() === "GUEST");

  const isAdmin = isSuperAdmin || isOrgAdmin;

  const primaryRole = isSuperAdmin
    ? "SUPER_ADMIN"
    : isOrgAdmin
    ? "ADMIN"
    : roles.length > 0
    ? roles[0]
    : "GUEST";

  const checkSinglePermission = useCallback(
    (perm: string): boolean => {
      if (!perm) return true;
      if (isAdmin) return true;
      if (permissions.includes("*") || permissions.includes("ALL")) return true;

      const normalized = perm.toLowerCase().replace("_", ":");
      return permissions.some((p) => {
        const pNorm = p.toLowerCase().replace("_", ":");
        return (
          pNorm === normalized ||
          pNorm === "*" ||
          pNorm === "all" ||
          pNorm.endsWith(":manage")
        );
      });
    },
    [permissions, isAdmin]
  );

  const hasPermission = useCallback(
    (permission: string): boolean => {
      return checkSinglePermission(permission);
    },
    [checkSinglePermission]
  );

  const hasAnyPermission = useCallback(
    (requiredPermissions: string[]): boolean => {
      if (!requiredPermissions || requiredPermissions.length === 0) return true;
      if (isAdmin) return true;
      return requiredPermissions.some((p) => checkSinglePermission(p));
    },
    [isAdmin, checkSinglePermission]
  );

  const hasAllPermissions = useCallback(
    (requiredPermissions: string[]): boolean => {
      if (!requiredPermissions || requiredPermissions.length === 0) return true;
      if (isAdmin) return true;
      return requiredPermissions.every((p) => checkSinglePermission(p));
    },
    [isAdmin, checkSinglePermission]
  );

  const hasRole = useCallback(
    (roleName: string | string[]): boolean => {
      const checkRoles = Array.isArray(roleName) ? roleName : [roleName];
      return checkRoles.some((targetRole) => {
        const tUpper = targetRole.toUpperCase();
        return roles.some((r) => {
          const rUpper = r.toUpperCase();
          return (
            rUpper === tUpper ||
            (rUpper === "SUPER_ADMIN" && ["ADMIN", "GUEST"].includes(tUpper)) ||
            (rUpper === "ADMIN" && tUpper === "GUEST")
          );
        });
      });
    },
    [roles]
  );

  return {
    permissions,
    roles,
    isSuperAdmin,
    isOrgAdmin,
    isGuest,
    isAdmin,
    primaryRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
  };
}
