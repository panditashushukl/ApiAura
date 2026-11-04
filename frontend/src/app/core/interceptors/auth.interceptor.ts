import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Ensure withCredentials is true so browser HttpOnly cookies are attached
  const cloned = req.clone({
    withCredentials: true,
  });

  return next(cloned).pipe(
    catchError((error: HttpErrorResponse) => {
      // If any authenticated request fails with 401, cookies are missing or invalid
      if (
        error.status === 401 &&
        !req.url.includes('/auth/login') &&
        !req.url.includes('/auth/register')
      ) {
        authService.clearSession();
      }
      return throwError(() => error);
    }),
  );
};

