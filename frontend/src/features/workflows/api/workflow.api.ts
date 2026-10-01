import { apiClient } from "@/lib/api/client";
import type {
  CreateWorkflowRequest,
  Workflow,
  WorkflowExecutionResponse,
} from "../types/workflow.types";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export async function executeWorkflow(
  workflowId: string,
  environmentId?: string
): Promise<WorkflowExecutionResponse> {
  const response = await apiClient<ApiResponse<WorkflowExecutionResponse>>(
    `/workflows/${workflowId}/execute`,
    {
      method: "POST",
      data: JSON.stringify({ environmentId }),
    }
  );
  return response.data;
}

export async function getWorkflows(workspaceId: string): Promise<Workflow[]> {
  const response = await apiClient<ApiResponse<Workflow[]>>(
    `/workspaces/${workspaceId}/workflows`
  );
  return response.data || [];
}

export async function createWorkflow(
  workspaceId: string,
  request: CreateWorkflowRequest
): Promise<Workflow> {
  const response = await apiClient<ApiResponse<Workflow>>(
    `/workspaces/${workspaceId}/workflows`,
    {
      method: "POST",
      data: JSON.stringify(request),
    }
  );
  return response.data;
}
