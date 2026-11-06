export interface UserWorkspaceInfo {
  id: string;
  name: string;
  slug: string;
  isMember: boolean;
}

export interface UserOrganizationInfo {
  id: string;
  name: string;
  slug: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  mobileNumber?: string;
  organizationId?: string;
  organizationName?: string;
  organizationSlug?: string;
  organizations?: UserOrganizationInfo[];
  workspaces?: UserWorkspaceInfo[];
  roles?: string[];
  permissions?: string[];
}

export interface AuthResponseData {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  user: UserProfile;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  mobileNumber?: string;
  organizationId?: string | null;
}
