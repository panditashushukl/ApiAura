export interface Organization {
  id: string;
  name: string;
  slug: string;
  ownerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationRequest {
  name: string;
  slug: string;
}

export interface UpdateOrganizationRequest {
  name?: string;
  slug?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}