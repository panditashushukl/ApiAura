import { apiClient } from "@/lib/api/client";

import type {
    ApiResponse,
    CreatePermissionRequest,
    Permission,
} from "../types/permission.types";


export async function getPermissions() {
    const response = await apiClient<
        ApiResponse<Permission[]>
    >("/permissions");

    return response.data;
}

export async function getPermission(
    permissionId: string
) {
    const response = await apiClient<
        ApiResponse<Permission>
    >(
        `/permissions/${permissionId}`
    );

    return response.data;
}

export async function createPermission(
    request: CreatePermissionRequest
) {
    const response = await apiClient<
        ApiResponse<Permission>
    >("/permissions", {
        method: "POST",
        data: JSON.stringify(request),
    });

    return response.data;
}

export async function deletePermission(
    permissionId: string
) {
    await apiClient<ApiResponse<void>>(
        `/permissions/${permissionId}`,
        {
            method: "DELETE",
        }
    );
}