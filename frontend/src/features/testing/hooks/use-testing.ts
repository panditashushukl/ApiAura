"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { executeTestSuite, getTestSuites } from "../api/testing.api";

export function useTestSuites(workspaceId: string | null) {
  return useQuery({
    queryKey: queryKeys.testing.suites(workspaceId ?? ""),
    queryFn: () => getTestSuites(workspaceId!),
    enabled: Boolean(workspaceId),
  });
}

export function useExecuteTestSuite() {
  return useMutation({
    mutationFn: ({
      testSuiteId,
      environmentId,
    }: {
      testSuiteId: string;
      environmentId?: string;
    }) => executeTestSuite(testSuiteId, environmentId),
  });
}
