"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import {
  getWorkflows,
  createWorkflow,
  executeWorkflow,
} from "../api/workflow.api";
import type { CreateWorkflowRequest } from "../types/workflow.types";

export function useWorkflows(workspaceId: string | null) {
  return useQuery({
    queryKey: queryKeys.workflows.all(workspaceId ?? ""),
    queryFn: () => getWorkflows(workspaceId!),
    enabled: Boolean(workspaceId),
  });
}

export function useCreateWorkflow(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateWorkflowRequest) =>
      createWorkflow(workspaceId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workflows.all(workspaceId),
      });
    },
  });
}

export function useExecuteWorkflow() {
  return useMutation({
    mutationFn: ({
      workflowId,
      environmentId,
    }: {
      workflowId: string;
      environmentId?: string;
    }) => executeWorkflow(workflowId, environmentId),
  });
}
