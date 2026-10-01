"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { executeApiRequest } from "../api/execution.api";
import type { ExecuteApiRequest } from "../types/execution.types";

export function useExecuteRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      request,
    }: {
      requestId: string;
      request: ExecuteApiRequest;
    }) => executeApiRequest(requestId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.history.all() });
    },
  });
}
