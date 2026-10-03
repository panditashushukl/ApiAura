import { apiClient } from "@/lib/api/client";

import type {
    ApiResponse,
    CreateUserRequest,
    UpdateUserRequest,
    UpdateUserStatusRequest,
    User,
} from "../types/user.types";

export async function getUsers(): Promise<User[]> {
    const response = await apiClient<
        ApiResponse<User[]>
    >("/users");

    return response.data;
}

export async function getUser(
    userId: string
): Promise<User> {
    const response = await apiClient<
        ApiResponse<User>
    >(`/users/${userId}`);

    return response.data;
}

export async function createUser(
    request: CreateUserRequest
): Promise<User> {
    const response = await apiClient<
        ApiResponse<User>
    >("/auth/register", {
        method: "POST",
        data: request,
    });

    return response.data;
}

export async function updateUser(
    userId: string,
    request: UpdateUserRequest
): Promise<User> {
    const response = await apiClient<
        ApiResponse<User>
    >(`/users/${userId}`, {
        method: "PATCH",
        data: request,
    });

    return response.data;
}

export async function updateUserStatus(
    userId: string,
    request: UpdateUserStatusRequest
): Promise<User> {
    const response = await apiClient<
        ApiResponse<User>
    >(`/users/${userId}/status?status=${encodeURIComponent(request.status)}`, {
        method: "PATCH",
    });

    return response.data;
}

export async function deleteUser(
    userId: string
): Promise<void> {
    await apiClient<ApiResponse<void>>(
        `/users/${userId}`,
        {
            method: "DELETE",
        }
    );
}

export async function getMyProfile(): Promise<User> {
    const response = await apiClient<ApiResponse<User>>("/users/me");
    return response.data;
}

export async function updateMyProfile(request: UpdateUserRequest): Promise<User> {
    const response = await apiClient<ApiResponse<User>>("/users/me", {
        method: "PATCH",
        data: request,
    });
    return response.data;
}

export async function changeMyPassword(request: { currentPassword: string; newPassword: string }): Promise<void> {
    await apiClient<ApiResponse<void>>("/users/me/change-password", {
        method: "POST",
        data: request,
    });
}

export async function adminResetPassword(userId: string, request: { newPassword: string }): Promise<void> {
    await apiClient<ApiResponse<void>>(`/users/${userId}/reset-password`, {
        method: "POST",
        data: request,
    });
}