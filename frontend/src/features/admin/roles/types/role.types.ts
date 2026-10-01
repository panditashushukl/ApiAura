export interface Permission {
    id: string;
    name: string;
    code?: string;
    resource?: string;
    action?: string;
    description: string | null;
}

export interface Role {
    id: string;
    name: string;
    description: string | null;
    permissions?: Permission[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateRoleRequest {
    name: string;
    description?: string;
}

export interface UpdateRoleRequest {
    name?: string;
    description?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}