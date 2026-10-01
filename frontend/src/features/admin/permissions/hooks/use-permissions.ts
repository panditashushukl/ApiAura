"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import {
  getPermissions,
  getPermission,
  createPermission,
  deletePermission,
} from "../api/permission.api";
import type { CreatePermissionRequest } from "../types/permission.types";

export function useAdminPermissions() {
  return useQuery({
    queryKey: queryKeys.permissions.all,
    queryFn: getPermissions,
  });
}

export function useAdminPermission(permissionId: string) {
  return useQuery({
    queryKey: queryKeys.permissions.detail(permissionId),
    queryFn: () => getPermission(permissionId),
    enabled: Boolean(permissionId),
  });
}

export function useCreatePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreatePermissionRequest) => createPermission(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.all });
    },
  });
}

export function useDeletePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (permissionId: string) => deletePermission(permissionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.all });
    },
  });
}
