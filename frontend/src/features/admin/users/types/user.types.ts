export type UserStatus =
    | "ACTIVE"
    | "INACTIVE"
    | "SUSPENDED"
    | "PENDING";

export interface User {
    id: string;
    name: string;
    email: string;
    status: UserStatus;
    lastLoginAt?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateUserRequest {
    name: string;
    email: string;
    password: string;
}

export interface UpdateUserRequest {
    name?: string;
    email?: string;
}

export interface UpdateUserStatusRequest {
    status: UserStatus;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}