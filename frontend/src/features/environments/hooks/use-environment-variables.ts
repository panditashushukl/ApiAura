"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import {
  getEnvironmentVariables,
  createEnvironmentVariable,
  updateEnvironmentVariable,
  deleteEnvironmentVariable,
} from "../api/environment.api";
import type {
  CreateEnvironmentVariableRequest,
  UpdateEnvironmentVariableRequest,
} from "../types/environment.types";

export function useEnvironmentVariables(environmentId: string | null) {
  return useQuery({
    queryKey: queryKeys.environments.variables(environmentId ?? ""),
    queryFn: () => getEnvironmentVariables(environmentId!),
    enabled: Boolean(environmentId),
  });
}

export function useCreateEnvironmentVariable(environmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateEnvironmentVariableRequest) =>
      createEnvironmentVariable(environmentId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.environments.variables(environmentId),
      });
    },
  });
}

export function useUpdateEnvironmentVariable(environmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      variableId,
      request,
    }: {
      variableId: string;
      request: UpdateEnvironmentVariableRequest;
    }) => updateEnvironmentVariable(environmentId, variableId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.environments.variables(environmentId),
      });
    },
  });
}

export function useDeleteEnvironmentVariable(environmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variableId: string) =>
      deleteEnvironmentVariable(environmentId, variableId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.environments.variables(environmentId),
      });
    },
  });
}
