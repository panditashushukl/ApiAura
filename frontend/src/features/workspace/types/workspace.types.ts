export type WorkspaceStatus =
    | "ACTIVE"
    | "ARCHIVED";

export interface Workspace {
    id: string;
    organizationId: string;
    name: string;
    slug: string;
    description: string | null;
    status: WorkspaceStatus;
    createdBy: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface WorkspaceMember {
    id: string;
    workspaceId: string;
    userId: string;
    status: string;
    invitedBy: string | null;
    joinedAt: string;
}

export interface CreateWorkspaceRequest {
    name: string;
    slug: string;
    description?: string;
}

export interface UpdateWorkspaceRequest {
    name?: string;
    slug?: string;
    description?: string;
    status?: WorkspaceStatus;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}