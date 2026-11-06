import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should extract first name correctly from full name', () => {
    service.currentUser.set({
      id: '1',
      name: 'Shukla Ji',
      email: 'shukla@example.com',
    });
    expect(service.firstName()).toBe('Shukla');

    service.currentUser.set({
      id: '2',
      name: 'Priya',
      email: 'priya@example.com',
    });
    expect(service.firstName()).toBe('Priya');
  });

  it('should authenticate via backend cookies using checkAuth()', () => {
    service.checkAuth().subscribe();

    const req = httpTesting.expectOne('http://localhost:8080/api/v1/users/me');
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);

    req.flush({
      success: true,
      message: 'Request successful',
      data: {
        id: 'u-123',
        name: 'Rohan Sharma',
        email: 'rohan@example.com',
      },
    });

    expect(service.currentUser()?.name).toBe('Rohan Sharma');
    expect(service.isAuthenticated()).toBe(true);
  });

  it('should reset currentUser to null when checkAuth() fails with 401 (cookies cleared/invalid)', () => {
    service.currentUser.set({
      id: 'u-123',
      name: 'Rohan Sharma',
      email: 'rohan@example.com',
    });

    service.checkAuth().subscribe();

    const req = httpTesting.expectOne('http://localhost:8080/api/v1/users/me');
    req.flush(
      { success: false, error: 'Unauthorized', message: 'Authentication required' },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should login and set in-memory state without storing credentials in localStorage', () => {
    service.login({ email: 'test@example.com', password: 'password' }).subscribe();

    const req = httpTesting.expectOne('http://localhost:8080/api/v1/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);

    req.flush({
      success: true,
      message: 'Login successful',
      data: {
        accessToken: 'mock-jwt-token',
        user: {
          id: 'u1',
          name: 'Shukla Ji',
          email: 'test@example.com',
        },
      },
    });

    expect(service.currentUser()?.name).toBe('Shukla Ji');
    expect(service.token()).toBe('mock-jwt-token');
    expect(service.isAuthenticated()).toBe(true);
    // User and Token are never trusted from localStorage; state is governed by HttpOnly cookies
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('should handle login error and extract message', () => {
    service.login({ email: 'bad@example.com', password: 'wrong' }).subscribe({
      error: () => {},
    });

    const req = httpTesting.expectOne('http://localhost:8080/api/v1/auth/login');
    req.flush(
      { success: false, message: 'Invalid email or password' },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(service.errorMessage()).toBe('Invalid email or password');
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should clear session on logout', () => {
    service.currentUser.set({
      id: 'u1',
      name: 'Shukla Ji',
      email: 'test@example.com',
    });
    service.token.set('mock-token');

    service.logout();

    const req = httpTesting.expectOne('http://localhost:8080/api/v1/auth/logout');
    req.flush({ success: true, message: 'Logged out' });

    expect(service.currentUser()).toBeNull();
    expect(service.token()).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(localStorage.getItem('accessToken')).toBeNull();
  });

  it('should refresh token and update currentUser and token signals', () => {
    service.refreshToken().subscribe();

    const req = httpTesting.expectOne('http://localhost:8080/api/v1/auth/refresh');
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);

    req.flush({
      success: true,
      message: 'Token refreshed',
      data: {
        accessToken: 'new-jwt-token',
        user: {
          id: 'u-refresh',
          name: 'Shukla Ji',
          email: 'test@example.com',
        },
      },
    });

    expect(service.currentUser()?.id).toBe('u-refresh');
    expect(service.token()).toBe('new-jwt-token');
    expect(service.isAuthenticated()).toBe(true);
  });

  it('should share single in-flight refresh request among concurrent callers', () => {
    let call1Done = false;
    let call2Done = false;

    service.refreshToken().subscribe((res) => {
      call1Done = true;
      expect(res.data.accessToken).toBe('shared-token');
    });

    service.refreshToken().subscribe((res) => {
      call2Done = true;
      expect(res.data.accessToken).toBe('shared-token');
    });

    // Only ONE HTTP request must be dispatched
    const req = httpTesting.expectOne('http://localhost:8080/api/v1/auth/refresh');
    req.flush({
      success: true,
      message: 'Token refreshed',
      data: {
        accessToken: 'shared-token',
        user: {
          id: 'u-shared',
          name: 'Shared User',
          email: 'shared@example.com',
        },
      },
    });

    expect(call1Done).toBe(true);
    expect(call2Done).toBe(true);
    expect(service.currentUser()?.name).toBe('Shared User');
  });
});
