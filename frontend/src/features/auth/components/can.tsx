"use client";

import { ReactNode } from "react";
import { usePermissions } from "../hooks/use-permissions";

interface CanProps {
  permission: string | string[];
  mode?: "all" | "any";
  fallback?: ReactNode;
  children: ReactNode;
}

export function Can({
  permission,
  mode = "all",
  fallback = null,
  children,
}: CanProps) {
  const { hasPermission, hasAllPermissions, hasAnyPermission } = usePermissions();

  let allowed = false;

  if (typeof permission === "string") {
    allowed = hasPermission(permission);
  } else if (Array.isArray(permission)) {
    allowed =
      mode === "any"
        ? hasAnyPermission(permission)
        : hasAllPermissions(permission);
  }

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
