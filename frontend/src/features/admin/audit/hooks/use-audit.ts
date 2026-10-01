"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { getWorkspaceAuditLogs, getUserAuditLogs } from "../api/audit.api";

export function useWorkspaceAuditLogs(
  workspaceId: string | null,
  page = 0,
  size = 20
) {
  return useQuery({
    queryKey: queryKeys.audit.all({ workspaceId, page, size }),
    queryFn: () => getWorkspaceAuditLogs(workspaceId!, page, size),
    enabled: Boolean(workspaceId),
  });
}

export function useUserAuditLogs(userId: string | null, page = 0, size = 20) {
  return useQuery({
    queryKey: queryKeys.audit.all({ userId, page, size }),
    queryFn: () => getUserAuditLogs(userId!, page, size),
    enabled: Boolean(userId),
  });
}
