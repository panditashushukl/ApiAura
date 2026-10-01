export type ExecutionStatus = "SUCCESS" | "FAILED" | "ERROR" | "CANCELLED";

export interface RequestHistoryItem {
  id: string;
  requestId: string;
  collectionId: string;
  environmentId?: string | null;
  method: string;
  url: string;
  status: ExecutionStatus;
  responseStatus?: number | null;
  durationMs?: number | null;
  responseSizeBytes?: number | null;
  createdAt: string;
}

export interface RequestHistoryDetail {
  id: string;
  requestId: string;
  collectionId: string;
  environmentId?: string | null;
  method: string;
  url: string;
  requestHeaders?: string | null;
  requestBody?: string | null;
  status: ExecutionStatus;
  responseStatus?: number | null;
  responseHeaders?: string | null;
  responseBody?: string | null;
  durationMs?: number | null;
  responseSizeBytes?: number | null;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt?: string;
}
