import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, map, of, shareReplay, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  AuthResponseData,
  LoginPayload,
  RegisterPayload,
  UserOrganizationInfo,
  UserProfile,
} from '../models/auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router, { optional: true });

  // Base URL with API versioning
  private readonly baseUrl = environment.apiBaseUrl;
  // Specific endpoint path for auth
  private readonly endpoint = '/auth';

  readonly currentUser = signal<UserProfile | null>(null);
  readonly userOrganizations = signal<UserOrganizationInfo[]>([]);
  readonly token = signal<string | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly isCheckingAuth = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly isAuthenticated = computed(() => !!this.currentUser());

  readonly isAdmin = computed(() => {
    const user = this.currentUser();
    if (!user) {
      return false;
    }
    const roles = user.roles || [];
    return roles.some((role) => {
      const code = role.toUpperCase();
      return code === 'ADMIN' || code === 'SUPER_ADMIN' || code.includes('ADMIN');
    });
  });

  readonly isSuperAdmin = computed(() => {
    const user = this.currentUser();
    if (!user) {
      return false;
    }
    const roles = user.roles || [];
    return roles.some((role) => role.toUpperCase() === 'SUPER_ADMIN');
  });

  readonly firstName = computed(() => {
    const user = this.currentUser();
    if (!user || !user.name) {
      return '';
    }
    const cleanName = user.name.trim();
    const parts = cleanName.split(/\s+/);
    return parts[0] || cleanName;
  });

  constructor() {
    this.cleanLegacyStorage();
  }

  /**
   * Purges any legacy user or token data from localStorage.
   * State is verified strictly via backend cookies.
   */
  private cleanLegacyStorage(): void {
    if (isPlatformBrowser(this.platformId) && typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
      } catch {
        // Storage access restricted
      }
    }
  }

  checkAuth(): Observable<UserProfile | null> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(null);
    }

    this.isCheckingAuth.set(true);
    return this.http
      .get<ApiResponse<UserProfile>>(`${this.baseUrl}/users/me`, {
        withCredentials: true,
      })
      .pipe(
        map((response) => {
          if (response?.data) {
            this.currentUser.set(response.data);
            return response.data;
          }
          this.currentUser.set(null);
          this.userOrganizations.set([]);
          return null;
        }),
        catchError(() => {
          this.currentUser.set(null);
          this.userOrganizations.set([]);
          return of(null);
        }),
        finalize(() => {
          this.isCheckingAuth.set(false);
        }),
      );
  }

  login(credentials: LoginPayload): Observable<ApiResponse<AuthResponseData>> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    return this.http
      .post<ApiResponse<AuthResponseData>>(`${this.baseUrl}${this.endpoint}/login`, credentials, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => {
          if (response?.data?.user) {
            this.handleAuthSuccess(response.data);
          }
        }),
        catchError((error: HttpErrorResponse) => {
          const msg = this.extractErrorMessage(
            error,
            'Login failed. Please check your credentials.',
          );
          this.errorMessage.set(msg);
          return throwError(() => error);
        }),
        finalize(() => {
          this.isLoading.set(false);
        }),
      );
  }

  register(payload: RegisterPayload): Observable<ApiResponse<AuthResponseData>> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    return this.http
      .post<ApiResponse<AuthResponseData>>(`${this.baseUrl}${this.endpoint}/register`, payload, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => {
          if (response?.data?.user) {
            this.handleAuthSuccess(response.data);
          }
        }),
        catchError((error: HttpErrorResponse) => {
          const msg = this.extractErrorMessage(error, 'Registration failed. Please try again.');
          this.errorMessage.set(msg);
          return throwError(() => error);
        }),
        finalize(() => {
          this.isLoading.set(false);
        }),
      );
  }

  logout(): void {
    this.clearSession();
    this.router?.navigate(['/']);

    this.http
      .post(
        `${this.baseUrl}${this.endpoint}/logout`,
        {},
        {
          withCredentials: true,
        },
      )
      .pipe(
        catchError(() => {
          return of(null);
        }),
      )
      .subscribe();
  }

  private refreshInProgress$: Observable<ApiResponse<AuthResponseData>> | null = null;

  /**
   * Refreshes the session using the HttpOnly refreshToken cookie.
   * Concurrent callers share the same in-flight Observable to prevent race conditions.
   */
  refreshToken(): Observable<ApiResponse<AuthResponseData>> {
    if (!isPlatformBrowser(this.platformId)) {
      return throwError(() => new Error('Refresh not supported outside browser'));
    }

    if (this.refreshInProgress$) {
      return this.refreshInProgress$;
    }

    this.refreshInProgress$ = this.http
      .post<ApiResponse<AuthResponseData>>(
        `${this.baseUrl}${this.endpoint}/refresh`,
        {},
        {
          withCredentials: true,
        },
      )
      .pipe(
        tap((response) => {
          if (response?.data?.user) {
            this.handleAuthSuccess(response.data);
          }
        }),
        shareReplay({ bufferSize: 1, refCount: true }),
        finalize(() => {
          this.refreshInProgress$ = null;
        }),
      );

    return this.refreshInProgress$;
  }

  clearSession(): void {
    this.currentUser.set(null);
    this.userOrganizations.set([]);
    this.token.set(null);
    this.errorMessage.set(null);
    this.cleanLegacyStorage();
    if (this.router && this.router.url.startsWith('/admin')) {
      this.router.navigate(['/']);
    }
  }

  loadUserOrganizations(): Observable<UserOrganizationInfo[]> {
    if (!isPlatformBrowser(this.platformId)) {
      return of([]);
    }

    return this.http
      .get<ApiResponse<UserOrganizationInfo[]>>(`${this.baseUrl}/organizations`, {
        withCredentials: true,
      })
      .pipe(
        map((response) => {
          const orgs = (response?.data || []).map((o) => ({
            id: o.id,
            name: o.name,
            slug: o.slug,
          }));
          this.userOrganizations.set(orgs);
          return orgs;
        }),
        catchError(() => {
          const current = this.currentUser();
          if (current?.organizationName && current?.organizationId) {
            const fallback: UserOrganizationInfo[] = [
              {
                id: current.organizationId,
                name: current.organizationName,
                slug: current.organizationSlug || '',
              },
            ];
            this.userOrganizations.set(fallback);
            return of(fallback);
          }
          this.userOrganizations.set([]);
          return of([]);
        }),
      );
  }

  switchOrganization(org: UserOrganizationInfo): Observable<UserProfile> {
    const user = this.currentUser();
    if (!user) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http
      .patch<ApiResponse<UserProfile>>(
        `${this.baseUrl}/users/me`,
        { organizationId: org.id },
        { withCredentials: true },
      )
      .pipe(
        map((res) => {
          const updatedUser: UserProfile = res?.data || {
            ...user,
            organizationId: org.id,
            organizationName: org.name,
            organizationSlug: org.slug,
          };
          this.currentUser.set(updatedUser);
          return updatedUser;
        }),
        catchError(() => {
          const updatedUser: UserProfile = {
            ...user,
            organizationId: org.id,
            organizationName: org.name,
            organizationSlug: org.slug,
          };
          this.currentUser.set(updatedUser);
          return of(updatedUser);
        }),
      );
  }

  forgotPassword(email: string): Observable<string> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    return this.http
      .post<ApiResponse<void>>(
        `${this.baseUrl}${this.endpoint}/forgot-password`,
        { email },
        { withCredentials: true },
      )
      .pipe(
        map((response) => response.message || 'If an account with this email exists, a password reset link has been dispatched.'),
        catchError((error: HttpErrorResponse) => {
          const message = this.extractErrorMessage(error, 'Failed to process password reset request.');
          this.errorMessage.set(message);
          return throwError(() => new Error(message));
        }),
        finalize(() => {
          this.isLoading.set(false);
        }),
      );
  }

  resetPassword(payload: { token: string; newPassword: string }): Observable<string> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    return this.http
      .post<ApiResponse<void>>(
        `${this.baseUrl}${this.endpoint}/reset-password`,
        payload,
        { withCredentials: true },
      )
      .pipe(
        map((response) => response.message || 'Password reset successfully. You can now log in with your new password.'),
        catchError((error: HttpErrorResponse) => {
          const message = this.extractErrorMessage(error, 'Failed to reset password.');
          this.errorMessage.set(message);
          return throwError(() => new Error(message));
        }),
        finalize(() => {
          this.isLoading.set(false);
        }),
      );
  }

  private handleAuthSuccess(data: AuthResponseData): void {
    this.currentUser.set(data.user);
    this.token.set(data.accessToken);
    this.errorMessage.set(null);
  }

  private extractErrorMessage(error: HttpErrorResponse, fallback: string): string {
    if (error.error) {
      if (typeof error.error === 'string') {
        return error.error;
      }
      if (error.error.message) {
        return error.error.message;
      }
      if (error.error.error) {
        return error.error.error;
      }
    }
    if (error.status === 0) {
      return 'Unable to connect to backend server. Make sure it is running on port 8080.';
    }
    return fallback;
  }
}
