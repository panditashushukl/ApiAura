"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import {
  getMyHistory,
  getHistoryByStatus,
  getExecutionDetail,
  deleteExecution,
} from "../api/history.api";
import type { ExecutionStatus } from "../types/history.types";

export function useMyHistory(page = 0, size = 20, statusFilter?: ExecutionStatus | "ALL") {
  return useQuery({
    queryKey: queryKeys.history.all({ page, size, statusFilter }),
    queryFn: () => {
      if (statusFilter && statusFilter !== "ALL") {
        return getHistoryByStatus(statusFilter, page, size);
      }
      return getMyHistory(page, size);
    },
  });
}

export function useExecutionDetail(executionId: string | null) {
  return useQuery({
    queryKey: queryKeys.history.detail(executionId ?? ""),
    queryFn: () => getExecutionDetail(executionId!),
    enabled: Boolean(executionId),
  });
}

export function useDeleteExecution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (executionId: string) => deleteExecution(executionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["history"] });
    },
  });
}
