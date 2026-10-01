export interface Collection {
  id: string;
  workspaceId: string;
  name: string;
  description?: string | null;
  baseUrl?: string | null;
  documentation?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCollectionRequest {
  name: string;
  description?: string;
  baseUrl?: string;
  documentation?: string;
}

export interface UpdateCollectionRequest {
  name?: string;
  description?: string;
  baseUrl?: string;
  documentation?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
