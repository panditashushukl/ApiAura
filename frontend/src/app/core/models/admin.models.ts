export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';

export interface AdminUserOrganization {
  id: string;
  name: string;
  slug: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  mobileNumber?: string;
  organizationId?: string;
  organizationName?: string;
  organizationSlug?: string;
  organizations?: AdminUserOrganization[];
  status: UserStatus;
  roles?: string[];
  permissions?: string[];
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  mobileNumber?: string;
  organizationId?: string;
  organizationIds?: string[];
  roleId?: string;
  roleIds?: string[];
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  mobileNumber?: string;
  organizationId?: string;
  organizationIds?: string[];
  clearOrganization?: boolean;
  roleIds?: string[];
}

export interface AdminRole {
  id: string;
  name: string;
  code: string;
  description?: string;
  systemRole: boolean;
  organizationId?: string;
  organizationName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRolePayload {
  name: string;
  code: string;
  description?: string;
  systemRole?: boolean;
  organizationId?: string;
}

export interface UpdateRolePayload {
  name?: string;
  description?: string;
}

export interface AdminPermission {
  id: string;
  name: string;
  code: string;
  resource: string;
  action: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePermissionPayload {
  name: string;
  code: string;
  resource: string;
  action: string;
  description?: string;
}

export interface AdminOrganization {
  id: string;
  name: string;
  slug: string;
  ownerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrganizationPayload {
  name: string;
  slug: string;
}

export interface UpdateOrganizationPayload {
  name?: string;
  slug?: string;
  ownerId?: string;
}

