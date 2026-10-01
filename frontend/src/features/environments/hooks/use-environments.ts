"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import {
  getEnvironments,
  getEnvironment,
  createEnvironment,
  updateEnvironment,
  activateEnvironment,
  deactivateEnvironment,
  deleteEnvironment,
} from "../api/environment.api";
import type {
  CreateEnvironmentRequest,
  UpdateEnvironmentRequest,
} from "../types/environment.types";

export function useEnvironments(workspaceId: string | null) {
  return useQuery({
    queryKey: queryKeys.environments.all(workspaceId ?? ""),
    queryFn: () => getEnvironments(workspaceId!),
    enabled: Boolean(workspaceId),
  });
}

export function useEnvironment(environmentId: string) {
  return useQuery({
    queryKey: queryKeys.environments.detail(environmentId),
    queryFn: () => getEnvironment(environmentId),
    enabled: Boolean(environmentId),
  });
}

export function useCreateEnvironment(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateEnvironmentRequest) =>
      createEnvironment(workspaceId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.environments.all(workspaceId),
      });
    },
  });
}

export function useUpdateEnvironment(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      environmentId,
      request,
    }: {
      environmentId: string;
      request: UpdateEnvironmentRequest;
    }) => updateEnvironment(environmentId, request),
    onSuccess: (_, { environmentId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.environments.detail(environmentId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.environments.all(workspaceId),
      });
    },
  });
}

export function useActivateEnvironment(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (environmentId: string) => activateEnvironment(environmentId),
    onSuccess: (_, environmentId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.environments.detail(environmentId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.environments.all(workspaceId),
      });
    },
  });
}

export function useDeactivateEnvironment(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (environmentId: string) => deactivateEnvironment(environmentId),
    onSuccess: (_, environmentId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.environments.detail(environmentId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.environments.all(workspaceId),
      });
    },
  });
}

export function useDeleteEnvironment(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (environmentId: string) => deleteEnvironment(environmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.environments.all(workspaceId),
      });
    },
  });
}
