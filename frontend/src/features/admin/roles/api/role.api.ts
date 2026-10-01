import { apiClient } from "@/lib/api/client";

import type {
    ApiResponse,
    CreateRoleRequest,
    Permission,
    Role,
    UpdateRoleRequest,
} from "../types/role.types";

export async function getRoles(): Promise<Role[]> {
    const response = await apiClient<
        ApiResponse<Role[]>
    >("/roles");

    return response.data;
}

export async function getRole(
    roleId: string
): Promise<Role> {
    const response = await apiClient<
        ApiResponse<Role>
    >(`/roles/${roleId}`);

    return response.data;
}

export async function createRole(
    request: CreateRoleRequest
): Promise<Role> {
    const response = await apiClient<
        ApiResponse<Role>
    >("/roles", {
        method: "POST",
        data: JSON.stringify(request),
    });

    return response.data;
}

export async function updateRole(
    roleId: string,
    request: UpdateRoleRequest
): Promise<Role> {
    const response = await apiClient<
        ApiResponse<Role>
    >(`/roles/${roleId}`, {
        method: "PATCH",
        data: JSON.stringify(request),
    });

    return response.data;
}

export async function deleteRole(
    roleId: string
): Promise<void> {
    await apiClient<ApiResponse<void>>(
        `/roles/${roleId}`,
        {
            method: "DELETE",
        }
    );
}

export async function getRolePermissions(
    roleId: string
): Promise<Permission[]> {
    const response = await apiClient<
        ApiResponse<Permission[]>
    >(`/roles/${roleId}/permissions`);

    return response.data;
}

export async function grantPermissionToRole(
    roleId: string,
    permissionId: string
): Promise<void> {
    await apiClient<ApiResponse<void>>(
        `/roles/${roleId}/permissions/${permissionId}`,
        {
            method: "PUT",
        }
    );
}

export async function revokePermissionFromRole(
    roleId: string,
    permissionId: string
): Promise<void> {
    await apiClient<ApiResponse<void>>(
        `/roles/${roleId}/permissions/${permissionId}`,
        {
            method: "DELETE",
        }
    );
}