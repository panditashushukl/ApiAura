import { apiClient } from "@/lib/api/client";

import type {
    ApiResponse,
    CreateWorkspaceRequest,
    UpdateWorkspaceRequest,
    Workspace,
    WorkspaceMember,
} from "../types/workspace.types";

export async function getWorkspaces(): Promise<Workspace[]> {
    const response = await apiClient<
        ApiResponse<Workspace[]>
    >("/workspaces");

    return response.data;
}

export async function getWorkspacesByOrganization(
    organizationId: string
): Promise<Workspace[]> {
    const response = await apiClient<
        ApiResponse<Workspace[]>
    >(`/workspaces/organization/${organizationId}`);

    return response.data;
}

export async function getWorkspace(
    workspaceId: string
): Promise<Workspace> {
    const response = await apiClient<
        ApiResponse<Workspace>
    >(`/workspaces/${workspaceId}`);

    return response.data;
}

export async function createWorkspace(
    organizationId: string,
    request: CreateWorkspaceRequest
): Promise<Workspace> {
    const response = await apiClient<
        ApiResponse<Workspace>
    >(
        `/workspaces/organization/${organizationId}`,
        {
            method: "POST",
            data: JSON.stringify(request),
        }
    );

    return response.data;
}

export async function updateWorkspace(
    workspaceId: string,
    request: UpdateWorkspaceRequest
): Promise<Workspace> {
    const response = await apiClient<
        ApiResponse<Workspace>
    >(
        `/workspaces/${workspaceId}`,
        {
            method: "PATCH",
            data: JSON.stringify(request),
        }
    );

    return response.data;
}

export async function deleteWorkspace(
    workspaceId: string
): Promise<void> {
    await apiClient<ApiResponse<void>>(
        `/workspaces/${workspaceId}`,
        {
            method: "DELETE",
        }
    );
}

export async function getWorkspaceMembers(
    workspaceId: string
): Promise<WorkspaceMember[]> {
    const response = await apiClient<
        ApiResponse<WorkspaceMember[]>
    >(`/workspaces/${workspaceId}/members`);

    return response.data;
}

export async function addWorkspaceMember(
    workspaceId: string,
    userId: string
): Promise<WorkspaceMember> {
    const response = await apiClient<
        ApiResponse<WorkspaceMember>
    >(`/workspaces/${workspaceId}/members/${userId}`, {
        method: "POST",
    });

    return response.data;
}

export async function removeWorkspaceMember(
    workspaceId: string,
    userId: string
): Promise<void> {
    await apiClient<ApiResponse<void>>(
        `/workspaces/${workspaceId}/members/${userId}`,
        {
            method: "DELETE",
        }
    );
}