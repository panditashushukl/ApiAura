import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, finalize, map, of, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  AuthResponseData,
  LoginPayload,
  RegisterPayload,
  UserProfile,
} from '../models/auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  // Base URL with API versioning
  private readonly baseUrl = environment.apiBaseUrl;
  // Specific endpoint path for auth
  private readonly endpoint = '/auth';

  readonly currentUser = signal<UserProfile | null>(null);
  readonly token = signal<string | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly isCheckingAuth = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly isAuthenticated = computed(() => !!this.currentUser());

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
          return null;
        }),
        catchError(() => {
          this.currentUser.set(null);
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

  clearSession(): void {
    this.currentUser.set(null);
    this.token.set(null);
    this.errorMessage.set(null);
    this.cleanLegacyStorage();
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
