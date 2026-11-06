import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpContextToken,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * HttpContextToken to mark retried requests and avoid infinite retry loops.
 */
export const IS_RETRY_REQUEST = new HttpContextToken<boolean>(() => false);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Ensure withCredentials is true so browser HttpOnly cookies are attached
  const cloned = req.clone({
    withCredentials: true,
  });

  return next(cloned).pipe(
    catchError((error: HttpErrorResponse) => {
      // If any authenticated request fails with 401 Unauthorized
      if (error.status === 401) {
        // Exclude authentication endpoints from refresh attempts
        const isAuthEndpoint =
          req.url.includes('/auth/login') ||
          req.url.includes('/auth/register') ||
          req.url.includes('/auth/refresh') ||
          req.url.includes('/auth/logout');

        if (isAuthEndpoint) {
          // If the refresh call itself returned 401, clear session immediately
          if (req.url.includes('/auth/refresh')) {
            authService.clearSession();
          }
          return throwError(() => error);
        }

        // If this request was already retried once after refresh, do not retry again
        if (req.context.get(IS_RETRY_REQUEST)) {
          authService.clearSession();
          return throwError(() => error);
        }

        // Transparently refresh token and retry the original request
        return authService.refreshToken().pipe(
          switchMap(() => {
            const retriedReq = req.clone({
              withCredentials: true,
              context: req.context.set(IS_RETRY_REQUEST, true),
            });
            return next(retriedReq);
          }),
          catchError((refreshError) => {
            authService.clearSession();
            return throwError(() => refreshError);
          }),
        );
      }

      return throwError(() => error);
    }),
  );
};
