import { apiClient } from "@/lib/api/client";
import type {
  TestExecutionResponse,
  TestSuite,
} from "../types/testing.types";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export async function executeTestSuite(
  testSuiteId: string,
  environmentId?: string
): Promise<TestExecutionResponse> {
  const response = await apiClient<ApiResponse<TestExecutionResponse>>(
    `/test-suites/${testSuiteId}/execute`,
    {
      method: "POST",
      data: JSON.stringify({ environmentId }),
    }
  );
  return response.data;
}

export async function getTestSuites(workspaceId: string): Promise<TestSuite[]> {
  const response = await apiClient<ApiResponse<TestSuite[]>>(
    `/workspaces/${workspaceId}/test-suites`
  );
  return response.data || [];
}
