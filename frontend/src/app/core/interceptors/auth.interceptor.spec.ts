import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor, IS_RETRY_REQUEST } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should automatically attach withCredentials: true to outgoing requests', () => {
    http.get('/api/v1/test').subscribe();

    const req = httpTesting.expectOne('/api/v1/test');
    expect(req.request.withCredentials).toBe(true);
    req.flush({ success: true });
  });

  it('should pass successful responses without refreshing', () => {
    let result: unknown = null;
    http.get('/api/v1/data').subscribe((res) => {
      result = res;
    });

    const req = httpTesting.expectOne('/api/v1/data');
    req.flush({ success: true, data: 'test-data' });

    expect(result).toEqual({ success: true, data: 'test-data' });
  });

  it('should silently refresh token on 401 and transparently retry the original request', () => {
    let finalResponse: unknown = null;

    http.get('/api/v1/workspaces').subscribe({
      next: (res) => {
        finalResponse = res;
      },
    });

    // 1. Initial request fails with 401 Unauthorized
    const initialReq = httpTesting.expectOne('/api/v1/workspaces');
    expect(initialReq.request.withCredentials).toBe(true);
    initialReq.flush(
      { success: false, message: 'Access token expired' },
      { status: 401, statusText: 'Unauthorized' },
    );

    // 2. Interceptor triggers POST /auth/refresh with withCredentials: true
    const refreshReq = httpTesting.expectOne('http://localhost:8080/api/v1/auth/refresh');
    expect(refreshReq.request.method).toBe('POST');
    expect(refreshReq.request.withCredentials).toBe(true);

    refreshReq.flush({
      success: true,
      message: 'Token refreshed',
      data: {
        accessToken: 'refreshed-jwt',
        user: {
          id: 'u-1',
          name: 'Shukla Ji',
          email: 'shukla@example.com',
        },
      },
    });

    // 3. Interceptor retries original request with IS_RETRY_REQUEST context
    const retriedReq = httpTesting.expectOne('/api/v1/workspaces');
    expect(retriedReq.request.withCredentials).toBe(true);
    expect(retriedReq.request.context.get(IS_RETRY_REQUEST)).toBe(true);

    retriedReq.flush({
      success: true,
      data: [{ id: 'ws-1', name: 'My Workspace' }],
    });

    // 4. Caller transparently gets retried response
    expect(finalResponse).toEqual({
      success: true,
      data: [{ id: 'ws-1', name: 'My Workspace' }],
    });
    expect(authService.currentUser()?.name).toBe('Shukla Ji');
  });

  it('should share single refresh request across multiple concurrent 401s and retry all', () => {
    let res1: unknown = null;
    let res2: unknown = null;

    http.get('/api/v1/workspaces').subscribe((res) => (res1 = res));
    http.get('/api/v1/collections').subscribe((res) => (res2 = res));

    // Both initial requests fail with 401
    const req1 = httpTesting.expectOne('/api/v1/workspaces');
    const req2 = httpTesting.expectOne('/api/v1/collections');

    req1.flush({ message: 'Token expired' }, { status: 401, statusText: 'Unauthorized' });
    req2.flush({ message: 'Token expired' }, { status: 401, statusText: 'Unauthorized' });

    // Only ONE refresh request must be sent
    const refreshReq = httpTesting.expectOne('http://localhost:8080/api/v1/auth/refresh');
    refreshReq.flush({
      success: true,
      message: 'Refreshed',
      data: {
        accessToken: 'new-token',
        user: { id: 'u-1', name: 'User 1', email: 'u1@example.com' },
      },
    });

    // Both requests must be retried
    const retry1 = httpTesting.expectOne('/api/v1/workspaces');
    const retry2 = httpTesting.expectOne('/api/v1/collections');

    retry1.flush({ data: 'workspaces-ok' });
    retry2.flush({ data: 'collections-ok' });

    expect(res1).toEqual({ data: 'workspaces-ok' });
    expect(res2).toEqual({ data: 'collections-ok' });
  });

  it('should clear session and fail when refresh endpoint itself returns 401', () => {
    const clearSpy = vi.spyOn(authService, 'clearSession');
    let errorReceived: unknown = null;

    http.get('/api/v1/workspaces').subscribe({
      error: (err) => {
        errorReceived = err;
      },
    });

    const initialReq = httpTesting.expectOne('/api/v1/workspaces');
    initialReq.flush({ message: 'Expired' }, { status: 401, statusText: 'Unauthorized' });

    const refreshReq = httpTesting.expectOne('http://localhost:8080/api/v1/auth/refresh');
    refreshReq.flush(
      { message: 'Refresh token expired' },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(clearSpy).toHaveBeenCalled();
    expect(errorReceived).toBeTruthy();
  });

  it('should not attempt refresh when /auth/login fails with 401', () => {
    let errorReceived: unknown = null;

    http.post('http://localhost:8080/api/v1/auth/login', { email: 'test', password: 'bad' }).subscribe({
      error: (err) => {
        errorReceived = err;
      },
    });

    const req = httpTesting.expectOne('http://localhost:8080/api/v1/auth/login');
    req.flush({ message: 'Bad credentials' }, { status: 401, statusText: 'Unauthorized' });

    // No refresh request should be issued
    httpTesting.expectNone('http://localhost:8080/api/v1/auth/refresh');
    expect(errorReceived).toBeTruthy();
  });

  it('should not retry again if a retried request fails with 401', () => {
    const clearSpy = vi.spyOn(authService, 'clearSession');
    let errorReceived: unknown = null;

    http.get('/api/v1/workspaces').subscribe({
      error: (err) => {
        errorReceived = err;
      },
    });

    // 1. Initial 401
    const initialReq = httpTesting.expectOne('/api/v1/workspaces');
    initialReq.flush({ message: 'Expired' }, { status: 401, statusText: 'Unauthorized' });

    // 2. Successful refresh
    const refreshReq = httpTesting.expectOne('http://localhost:8080/api/v1/auth/refresh');
    refreshReq.flush({
      success: true,
      data: {
        accessToken: 'new-token',
        user: { id: 'u-1', name: 'User 1', email: 'u1@example.com' },
      },
    });

    // 3. Retried request ALSO fails with 401
    const retriedReq = httpTesting.expectOne('/api/v1/workspaces');
    retriedReq.flush({ message: 'Still Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    // Must NOT trigger another refresh
    httpTesting.expectNone('http://localhost:8080/api/v1/auth/refresh');
    expect(clearSpy).toHaveBeenCalled();
    expect(errorReceived).toBeTruthy();
  });
});

