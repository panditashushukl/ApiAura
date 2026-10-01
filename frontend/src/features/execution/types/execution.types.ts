export type ExecutionStatus = "SUCCESS" | "FAILED" | "ERROR" | "CANCELLED";

export interface ApiExecutionResponse {
  id: string;
  requestId: string;
  environmentId?: string | null;
  status: ExecutionStatus;
  method: string;
  url: string;
  requestHeaders?: string | null;
  requestBody?: string | null;
  responseStatus?: number | null;
  responseHeaders?: string | null;
  responseBody?: string | null;
  durationMs?: number | null;
  responseSizeBytes?: number | null;
  errorMessage?: string | null;
  createdAt: string;
}

export interface ExecuteApiRequest {
  environmentId?: string | null;
  variables?: Record<string, string>;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
