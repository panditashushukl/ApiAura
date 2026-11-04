# Rule: Cookie-Driven Authentication Flow

## Critical Invariant
Authentication in ApiAura must **ALWAYS** remain purely cookie-driven (`HttpOnly` cookies set by Spring Boot) and backend-verified. It must never regress to `localStorage`.

## Invariant Directives:
1. **Never store user or token in `localStorage` or `sessionStorage`:**
   - Any token or user state in `localStorage` bypasses backend session invalidation and causes false positive logins when cookies are cleared.
   - Always purge `localStorage.removeItem('user')` and `localStorage.removeItem('accessToken')`.
2. **Always verify session on bootstrap:**
   - Angular application initialization must execute `AuthService.checkAuth()` (`GET /api/v1/users/me` with `withCredentials: true`) inside `provideAppInitializer` in `app.config.ts`.
   - If cookies are missing, invalid, or cleared, the backend returns `401 Unauthorized`, and `currentUser` remains `null`.
3. **Always send credentials with requests:**
   - Outgoing requests must have `withCredentials: true` via `authInterceptor`.
   - On `401 Unauthorized` for authenticated endpoints, the interceptor must trigger `authService.clearSession()`.
4. **Always manage auth state via Angular Signals in `AuthService`:**
   - `currentUser = signal<UserProfile | null>(null)`
   - Computed states: `isAuthenticated`, `firstName`
5. **Always test after changes:**
   - `npm test -- --watch=false`
   - `npm run build`

