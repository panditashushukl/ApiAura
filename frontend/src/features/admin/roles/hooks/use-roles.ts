"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import {
  getRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  getRolePermissions,
  grantPermissionToRole,
  revokePermissionFromRole,
} from "../api/role.api";
import type { CreateRoleRequest, UpdateRoleRequest } from "../types/role.types";

export function useRoles() {
  return useQuery({
    queryKey: queryKeys.roles.all,
    queryFn: getRoles,
  });
}

export function useRole(roleId: string) {
  return useQuery({
    queryKey: queryKeys.roles.detail(roleId),
    queryFn: () => getRole(roleId),
    enabled: Boolean(roleId),
  });
}

export function useRolePermissions(roleId: string) {
  return useQuery({
    queryKey: queryKeys.roles.permissions(roleId),
    queryFn: () => getRolePermissions(roleId),
    enabled: Boolean(roleId),
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateRoleRequest) => createRole(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, request }: { roleId: string; request: UpdateRoleRequest }) =>
      updateRole(roleId, request),
    onSuccess: (_, { roleId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.detail(roleId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roleId: string) => deleteRole(roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
    },
  });
}

export function useToggleRolePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      roleId,
      permissionId,
      grant,
    }: {
      roleId: string;
      permissionId: string;
      grant: boolean;
    }) => {
      if (grant) {
        await grantPermissionToRole(roleId, permissionId);
      } else {
        await revokePermissionFromRole(roleId, permissionId);
      }
    },
    onSuccess: (_, { roleId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.permissions(roleId) });
    },
  });
}
