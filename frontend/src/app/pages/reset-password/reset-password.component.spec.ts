import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { ResetPasswordComponent } from './reset-password.component';
import { AuthService } from '../../core/services/auth.service';
import { AuthModalService } from '../../core/services/auth-modal.service';

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;
  let authService: AuthService;
  let authModalService: AuthModalService;
  let router: Router;

  const mockQueryParamMap = {
    get: vi.fn((key: string) => (key === 'token' ? 'valid-reset-token-123' : null)),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResetPasswordComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(mockQueryParamMap),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    authModalService = TestBed.inject(AuthModalService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should initialize token from query parameters', () => {
    expect(component.token()).toBe('valid-reset-token-123');
    expect(component.errorMessage()).toBeNull();
  });

  it('should detect password mismatches', () => {
    component.newPassword.set('password123');
    component.confirmPassword.set('different123');
    expect(component.passwordsMismatch()).toBe(true);
    expect(component.isFormValid()).toBe(false);

    component.confirmPassword.set('password123');
    expect(component.passwordsMismatch()).toBe(false);
    expect(component.isFormValid()).toBe(true);
  });

  it('should successfully submit reset password request and show success message', () => {
    const resetSpy = vi.spyOn(authService, 'resetPassword').mockReturnValue(
      of('Password has been reset successfully.'),
    );

    component.newPassword.set('newPassword123');
    component.confirmPassword.set('newPassword123');
    component.onSubmit();

    expect(resetSpy).toHaveBeenCalledWith({
      token: 'valid-reset-token-123',
      newPassword: 'newPassword123',
    });
    expect(component.isSuccess()).toBe(true);
    expect(component.isLoading()).toBe(false);
  });

  it('should handle reset password failure gracefully', () => {
    vi.spyOn(authService, 'resetPassword').mockReturnValue(
      throwError(() => ({ message: 'Invalid or expired reset token' })),
    );

    component.newPassword.set('newPassword123');
    component.confirmPassword.set('newPassword123');
    component.onSubmit();

    expect(component.isSuccess()).toBe(false);
    expect(component.errorMessage()).toBe('Invalid or expired reset token');
    expect(component.isLoading()).toBe(false);
  });

  it('should navigate to home and open login modal on goToLogin', async () => {
    const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const openLoginSpy = vi.spyOn(authModalService, 'openLogin');

    component.goToLogin();
    await fixture.whenStable();

    expect(navSpy).toHaveBeenCalledWith(['/']);
    expect(openLoginSpy).toHaveBeenCalled();
  });
});
