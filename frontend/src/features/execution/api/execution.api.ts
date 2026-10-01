import { apiClient } from "@/lib/api/client";
import type {
  ApiResponse,
  ApiExecutionResponse,
  ExecuteApiRequest,
} from "../types/execution.types";

export async function executeApiRequest(
  requestId: string,
  request: ExecuteApiRequest
): Promise<ApiExecutionResponse> {
  const response = await apiClient<ApiResponse<ApiExecutionResponse>>(
    `/requests/${requestId}/execute`,
    {
      method: "POST",
      data: JSON.stringify(request),
    }
  );
  return response.data;
}
