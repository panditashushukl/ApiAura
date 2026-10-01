export interface Permission {
    id: string;
    name: string;
    code: string;
    resource: string;
    action: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePermissionRequest {
    name: string;
    code: string;
    resource: string;
    action: string;
    description?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}