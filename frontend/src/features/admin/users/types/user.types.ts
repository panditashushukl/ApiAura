export type UserStatus =
    | "ACTIVE"
    | "INACTIVE"
    | "SUSPENDED"
    | "PENDING";

export interface User {
    id: string;
    name: string;
    email: string;
    mobileNumber?: string | null;
    organizationId?: string | null;
    organizationName?: string | null;
    status: UserStatus;
    roles?: string[];
    permissions?: string[];
    lastLoginAt?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateUserRequest {
    name: string;
    email: string;
    password: string;
    mobileNumber?: string;
}

export interface UpdateUserRequest {
    name?: string;
    email?: string;
    mobileNumber?: string;
}

export interface UpdateUserStatusRequest {
    status: UserStatus;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}