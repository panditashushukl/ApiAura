import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.models';
import {
  AdminOrganization,
  AdminPermission,
  AdminRole,
  AdminUser,
  CreateOrganizationPayload,
  CreatePermissionPayload,
  CreateRolePayload,
  CreateUserPayload,
  UpdateOrganizationPayload,
  UpdateRolePayload,
  UpdateUserPayload,
} from '../models/admin.models';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  // --- Users CRUD ---

  getUsers(): Observable<AdminUser[]> {
    return this.http
      .get<ApiResponse<AdminUser[]>>(`${this.baseUrl}/users`, { withCredentials: true })
      .pipe(map((res) => res.data || []));
  }

  getUserById(userId: string): Observable<AdminUser> {
    return this.http
      .get<ApiResponse<AdminUser>>(`${this.baseUrl}/users/${userId}`, { withCredentials: true })
      .pipe(map((res) => res.data));
  }

  createUser(payload: CreateUserPayload): Observable<AdminUser> {
    return this.http
      .post<ApiResponse<AdminUser>>(`${this.baseUrl}/users`, payload, { withCredentials: true })
      .pipe(map((res) => res.data));
  }

  updateUser(userId: string, payload: UpdateUserPayload): Observable<AdminUser> {
    return this.http
      .patch<ApiResponse<AdminUser>>(`${this.baseUrl}/users/${userId}`, payload, {
        withCredentials: true,
      })
      .pipe(map((res) => res.data));
  }

  updateUserStatus(userId: string, status: string): Observable<AdminUser> {
    return this.http
      .patch<ApiResponse<AdminUser>>(
        `${this.baseUrl}/users/${userId}/status`,
        {},
        {
          params: { status },
          withCredentials: true,
        },
      )
      .pipe(map((res) => res.data));
  }

  deleteUser(userId: string): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.baseUrl}/users/${userId}`, { withCredentials: true })
      .pipe(map(() => void 0));
  }

  getUserRoles(userId: string): Observable<AdminRole[]> {
    return this.http
      .get<ApiResponse<AdminRole[]>>(`${this.baseUrl}/users/${userId}/roles`, {
        withCredentials: true,
      })
      .pipe(map((res) => res.data || []));
  }

  assignRoleToUser(userId: string, roleId: string): Observable<void> {
    return this.http
      .put<ApiResponse<void>>(
        `${this.baseUrl}/users/${userId}/roles/${roleId}`,
        {},
        { withCredentials: true },
      )
      .pipe(map(() => void 0));
  }

  removeRoleFromUser(userId: string, roleId: string): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.baseUrl}/users/${userId}/roles/${roleId}`, {
        withCredentials: true,
      })
      .pipe(map(() => void 0));
  }

  resetUserPassword(userId: string, newPassword: string): Observable<void> {
    return this.http
      .post<ApiResponse<void>>(
        `${this.baseUrl}/users/${userId}/reset-password`,
        { newPassword },
        { withCredentials: true },
      )
      .pipe(map(() => void 0));
  }

  // --- Roles CRUD ---

  getRoles(): Observable<AdminRole[]> {
    return this.http
      .get<ApiResponse<AdminRole[]>>(`${this.baseUrl}/roles`, { withCredentials: true })
      .pipe(map((res) => res.data || []));
  }

  getRoleById(roleId: string): Observable<AdminRole> {
    return this.http
      .get<ApiResponse<AdminRole>>(`${this.baseUrl}/roles/${roleId}`, { withCredentials: true })
      .pipe(map((res) => res.data));
  }

  createRole(payload: CreateRolePayload): Observable<AdminRole> {
    return this.http
      .post<ApiResponse<AdminRole>>(`${this.baseUrl}/roles`, payload, { withCredentials: true })
      .pipe(map((res) => res.data));
  }

  updateRole(roleId: string, payload: UpdateRolePayload): Observable<AdminRole> {
    return this.http
      .patch<ApiResponse<AdminRole>>(`${this.baseUrl}/roles/${roleId}`, payload, {
        withCredentials: true,
      })
      .pipe(map((res) => res.data));
  }

  deleteRole(roleId: string): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.baseUrl}/roles/${roleId}`, { withCredentials: true })
      .pipe(map(() => void 0));
  }

  getRolePermissions(roleId: string): Observable<AdminPermission[]> {
    return this.http
      .get<ApiResponse<AdminPermission[]>>(`${this.baseUrl}/roles/${roleId}/permissions`, {
        withCredentials: true,
      })
      .pipe(map((res) => res.data || []));
  }

  grantPermissionToRole(roleId: string, permissionId: string): Observable<void> {
    return this.http
      .put<ApiResponse<void>>(
        `${this.baseUrl}/roles/${roleId}/permissions/${permissionId}`,
        {},
        { withCredentials: true },
      )
      .pipe(map(() => void 0));
  }

  revokePermissionFromRole(roleId: string, permissionId: string): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.baseUrl}/roles/${roleId}/permissions/${permissionId}`, {
        withCredentials: true,
      })
      .pipe(map(() => void 0));
  }

  // --- Permissions CRUD ---

  getPermissions(): Observable<AdminPermission[]> {
    return this.http
      .get<ApiResponse<AdminPermission[]>>(`${this.baseUrl}/permissions`, {
        withCredentials: true,
      })
      .pipe(map((res) => res.data || []));
  }

  createPermission(payload: CreatePermissionPayload): Observable<AdminPermission> {
    return this.http
      .post<ApiResponse<AdminPermission>>(`${this.baseUrl}/permissions`, payload, {
        withCredentials: true,
      })
      .pipe(map((res) => res.data));
  }

  deletePermission(permissionId: string): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.baseUrl}/permissions/${permissionId}`, {
        withCredentials: true,
      })
      .pipe(map(() => void 0));
  }

  // --- Organizations CRUD ---

  getOrganizations(): Observable<AdminOrganization[]> {
    return this.http
      .get<ApiResponse<AdminOrganization[]>>(`${this.baseUrl}/organizations`, {
        withCredentials: true,
      })
      .pipe(map((res) => res.data || []));
  }

  getOrganizationById(orgId: string): Observable<AdminOrganization> {
    return this.http
      .get<ApiResponse<AdminOrganization>>(`${this.baseUrl}/organizations/${orgId}`, {
        withCredentials: true,
      })
      .pipe(map((res) => res.data));
  }

  createOrganization(payload: CreateOrganizationPayload): Observable<AdminOrganization> {
    return this.http
      .post<ApiResponse<AdminOrganization>>(`${this.baseUrl}/organizations`, payload, {
        withCredentials: true,
      })
      .pipe(map((res) => res.data));
  }

  updateOrganization(
    orgId: string,
    payload: UpdateOrganizationPayload,
  ): Observable<AdminOrganization> {
    return this.http
      .patch<ApiResponse<AdminOrganization>>(`${this.baseUrl}/organizations/${orgId}`, payload, {
        withCredentials: true,
      })
      .pipe(map((res) => res.data));
  }

  deleteOrganization(orgId: string): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.baseUrl}/organizations/${orgId}`, {
        withCredentials: true,
      })
      .pipe(map(() => void 0));
  }
}

