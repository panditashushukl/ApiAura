import { apiClient } from "@/lib/api/client";
import type { AuditLog, PageAuditLogResponse } from "../types/audit.types";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export async function getWorkspaceAuditLogs(
  workspaceId: string,
  page = 0,
  size = 20
): Promise<PageAuditLogResponse> {
  const response = await apiClient<ApiResponse<PageAuditLogResponse> | ApiResponse<AuditLog[]>>(
    `/workspaces/${workspaceId}/audit-logs?page=${page}&size=${size}`
  );

  const data = response.data;
  if (Array.isArray(data)) {
    return {
      content: data,
      totalElements: data.length,
      totalPages: 1,
      size: data.length,
      number: 0,
    };
  }
  return data;
}

export async function getUserAuditLogs(
  userId: string,
  page = 0,
  size = 20
): Promise<PageAuditLogResponse> {
  const response = await apiClient<ApiResponse<PageAuditLogResponse>>(
    `/audit-logs/user/${userId}?page=${page}&size=${size}`
  );
  return response.data;
}
