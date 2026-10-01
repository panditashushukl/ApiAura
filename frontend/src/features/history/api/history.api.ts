import { apiClient } from "@/lib/api/client";
import type {
  ExecutionStatus,
  RequestHistoryDetail,
  RequestHistoryItem,
} from "../types/history.types";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export async function getMyHistory(
  page = 0,
  size = 20
): Promise<PageResponse<RequestHistoryItem>> {
  const response = await apiClient<ApiResponse<PageResponse<RequestHistoryItem>>>(
    `/history?page=${page}&size=${size}`
  );
  return response.data;
}

export async function getHistoryByStatus(
  status: ExecutionStatus,
  page = 0,
  size = 20
): Promise<PageResponse<RequestHistoryItem>> {
  const response = await apiClient<ApiResponse<PageResponse<RequestHistoryItem>>>(
    `/history/status/${status}?page=${page}&size=${size}`
  );
  return response.data;
}

export async function getExecutionDetail(
  executionId: string
): Promise<RequestHistoryDetail> {
  const response = await apiClient<ApiResponse<RequestHistoryDetail>>(
    `/history/${executionId}`
  );
  return response.data;
}

export async function deleteExecution(executionId: string): Promise<void> {
  await apiClient<ApiResponse<void>>(`/history/${executionId}`, {
    method: "DELETE",
  });
}
