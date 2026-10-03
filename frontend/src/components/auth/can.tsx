"use client";

import React from "react";
import { usePermissions } from "@/features/auth/hooks/use-permissions";

export interface CanProps {
  /**
   * Permission code to check (e.g. "user:manage", "request:create")
   */
  I?: string;
  /**
   * Optional resource alias
   */
  a?: string;
  /**
   * Role(s) required to view (e.g. "SUPER_ADMIN" or ["SUPER_ADMIN", "ADMIN"])
   */
  role?: string | string[];
  /**
   * Content to render if permission/role check passes
   */
  children: React.ReactNode;
  /**
   * Optional fallback element if check fails
   */
  fallback?: React.ReactNode;
}

/**
 * Fine-grained Permission & Role based UI wrapper following industry standard RBAC.
 */
export function Can({ I, role, children, fallback = null }: CanProps) {
  const { hasPermission, hasRole } = usePermissions();

  let allowed = true;

  if (I) {
    allowed = allowed && hasPermission(I);
  }

  if (role) {
    allowed = allowed && hasRole(role);
  }

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
