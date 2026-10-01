import { apiClient } from "@/lib/api/client";
import type {
  CreateEnvironmentRequest,
  CreateEnvironmentVariableRequest,
  Environment,
  EnvironmentVariable,
  UpdateEnvironmentRequest,
  UpdateEnvironmentVariableRequest,
} from "../types/environment.types";

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

export async function getEnvironments(
  workspaceId: string,
  page = 0,
  size = 50
): Promise<Environment[]> {
  const response = await apiClient<ApiResponse<PageResponse<Environment>> | ApiResponse<Environment[]>>(
    `/workspaces/${workspaceId}/environments?page=${page}&size=${size}`
  );

  const data = response.data;
  if (Array.isArray(data)) {
    return data;
  }
  return data.content || [];
}

export async function getEnvironment(environmentId: string): Promise<Environment> {
  const response = await apiClient<ApiResponse<Environment>>(`/environments/${environmentId}`);
  return response.data;
}

export async function createEnvironment(
  workspaceId: string,
  request: CreateEnvironmentRequest
): Promise<Environment> {
  const response = await apiClient<ApiResponse<Environment>>(
    `/workspaces/${workspaceId}/environments`,
    {
      method: "POST",
      data: JSON.stringify(request),
    }
  );
  return response.data;
}

export async function updateEnvironment(
  environmentId: string,
  request: UpdateEnvironmentRequest
): Promise<Environment> {
  const response = await apiClient<ApiResponse<Environment>>(
    `/environments/${environmentId}`,
    {
      method: "PATCH",
      data: JSON.stringify(request),
    }
  );
  return response.data;
}

export async function activateEnvironment(environmentId: string): Promise<Environment> {
  const response = await apiClient<ApiResponse<Environment>>(
    `/environments/${environmentId}/activate`,
    { method: "POST" }
  );
  return response.data;
}

export async function deactivateEnvironment(environmentId: string): Promise<Environment> {
  const response = await apiClient<ApiResponse<Environment>>(
    `/environments/${environmentId}/deactivate`,
    { method: "POST" }
  );
  return response.data;
}

export async function deleteEnvironment(environmentId: string): Promise<void> {
  await apiClient<ApiResponse<void>>(`/environments/${environmentId}`, {
    method: "DELETE",
  });
}

export async function getEnvironmentVariables(
  environmentId: string
): Promise<EnvironmentVariable[]> {
  const response = await apiClient<ApiResponse<EnvironmentVariable[]>>(
    `/environments/${environmentId}/variables`
  );
  return response.data || [];
}

export async function createEnvironmentVariable(
  environmentId: string,
  request: CreateEnvironmentVariableRequest
): Promise<EnvironmentVariable> {
  const response = await apiClient<ApiResponse<EnvironmentVariable>>(
    `/environments/${environmentId}/variables`,
    {
      method: "POST",
      data: JSON.stringify(request),
    }
  );
  return response.data;
}

export async function updateEnvironmentVariable(
  environmentId: string,
  variableId: string,
  request: UpdateEnvironmentVariableRequest
): Promise<EnvironmentVariable> {
  const response = await apiClient<ApiResponse<EnvironmentVariable>>(
    `/environments/${environmentId}/variables/${variableId}`,
    {
      method: "PATCH",
      data: JSON.stringify(request),
    }
  );
  return response.data;
}

export async function deleteEnvironmentVariable(
  environmentId: string,
  variableId: string
): Promise<void> {
  await apiClient<ApiResponse<void>>(
    `/environments/${environmentId}/variables/${variableId}`,
    { method: "DELETE" }
  );
}
