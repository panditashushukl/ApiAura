import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthModalComponent } from './auth-modal';
import { AuthModalService } from '../../core/services/auth-modal.service';
import { AuthService } from '../../core/services/auth.service';

describe('AuthModalComponent', () => {
  let component: AuthModalComponent;
  let fixture: ComponentFixture<AuthModalComponent>;
  let authModalService: AuthModalService;
  let authService: AuthService;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthModalComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthModalComponent);
    component = fixture.componentInstance;
    authModalService = TestBed.inject(AuthModalService);
    authService = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create auth modal component', () => {
    expect(component).toBeTruthy();
  });

  it('should not display dialog when isOpen is false', () => {
    authModalService.isOpen.set(false);
    fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
    expect(dialog).toBeNull();
  });

  describe('Login Mode', () => {
    beforeEach(() => {
      authModalService.openLogin();
      fixture.detectChanges();
    });

    it('should show email and password fields, but not register-only fields', () => {
      const emailInput = fixture.nativeElement.querySelector('#auth-email');
      const passwordInput = fixture.nativeElement.querySelector('#auth-password');
      const nameInput = fixture.nativeElement.querySelector('#auth-name');
      const phoneInput = fixture.nativeElement.querySelector('#auth-phone');
      const confirmPasswordInput = fixture.nativeElement.querySelector('#auth-confirm-password');

      expect(emailInput).toBeTruthy();
      expect(passwordInput).toBeTruthy();
      expect(nameInput).toBeNull();
      expect(phoneInput).toBeNull();
      expect(confirmPasswordInput).toBeNull();
    });

    it('should toggle password visibility when eye button is clicked', () => {
      const passwordInput = fixture.nativeElement.querySelector(
        '#auth-password',
      ) as HTMLInputElement;
      expect(passwordInput.type).toBe('password');

      const eyeButton = passwordInput.parentElement?.querySelector('button') as HTMLButtonElement;
      expect(eyeButton).toBeTruthy();

      eyeButton.click();
      fixture.detectChanges();

      const updatedInput = fixture.nativeElement.querySelector(
        '#auth-password',
      ) as HTMLInputElement;
      expect(updatedInput.type).toBe('text');

      eyeButton.click();
      fixture.detectChanges();

      const revertedInput = fixture.nativeElement.querySelector(
        '#auth-password',
      ) as HTMLInputElement;
      expect(revertedInput.type).toBe('password');
    });

    it('should submit login request to backend and close on success', () => {
      component.email.set('user@example.com');
      component.password.set('password123');
      fixture.detectChanges();

      component.onSubmit();

      const req = httpTesting.expectOne('http://localhost:8080/api/v1/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        email: 'user@example.com',
        password: 'password123',
      });

      req.flush({
        success: true,
        message: 'Login successful',
        data: {
          accessToken: 'mock-jwt-token',
          user: {
            id: '1',
            name: 'John Doe',
            email: 'user@example.com',
          },
        },
      });

      expect(authService.currentUser()?.name).toBe('John Doe');
      expect(authModalService.isOpen()).toBe(false);
    });
  });

  describe('Register Mode & Confirm Password Validation', () => {
    beforeEach(() => {
      authModalService.openRegister();
      fixture.detectChanges();
    });

    it('should show exactly name, email, phone number, password, and confirm password fields', () => {
      const nameInput = fixture.nativeElement.querySelector('#auth-name');
      const emailInput = fixture.nativeElement.querySelector('#auth-email');
      const phoneInput = fixture.nativeElement.querySelector('#auth-phone');
      const passwordInput = fixture.nativeElement.querySelector('#auth-password');
      const confirmPasswordInput = fixture.nativeElement.querySelector('#auth-confirm-password');

      expect(nameInput).toBeTruthy();
      expect(emailInput).toBeTruthy();
      expect(phoneInput).toBeTruthy();
      expect(passwordInput).toBeTruthy();
      expect(confirmPasswordInput).toBeTruthy();
    });

    it('should toggle confirm password visibility with its eye button', () => {
      const confirmInput = fixture.nativeElement.querySelector(
        '#auth-confirm-password',
      ) as HTMLInputElement;
      expect(confirmInput.type).toBe('password');

      const eyeButton = confirmInput.parentElement?.querySelector('button') as HTMLButtonElement;
      expect(eyeButton).toBeTruthy();

      eyeButton.click();
      fixture.detectChanges();

      const updatedInput = fixture.nativeElement.querySelector(
        '#auth-confirm-password',
      ) as HTMLInputElement;
      expect(updatedInput.type).toBe('text');

      eyeButton.click();
      fixture.detectChanges();

      const revertedInput = fixture.nativeElement.querySelector(
        '#auth-confirm-password',
      ) as HTMLInputElement;
      expect(revertedInput.type).toBe('password');
    });

    it('should detect password mismatch and show error', () => {
      component.password.set('Secret123');
      component.confirmPassword.set('Secret999');
      fixture.detectChanges();

      expect(component.passwordsMismatch()).toBe(true);

      const errorMsg = fixture.nativeElement.querySelector('.text-rose-600');
      expect(errorMsg).toBeTruthy();
      expect(errorMsg.textContent).toContain('Passwords do not match');

      const submitBtn = fixture.nativeElement.querySelector(
        'button[type="submit"]',
      ) as HTMLButtonElement;
      expect(submitBtn.disabled).toBe(true);
    });

    it('should clear mismatch error when passwords match', () => {
      component.password.set('Secret123');
      component.confirmPassword.set('Secret123');
      fixture.detectChanges();

      expect(component.passwordsMismatch()).toBe(false);

      const errorMsg = fixture.nativeElement.querySelector('.text-rose-600');
      expect(errorMsg).toBeNull();

      const submitBtn = fixture.nativeElement.querySelector(
        'button[type="submit"]',
      ) as HTMLButtonElement;
      expect(submitBtn.disabled).toBe(false);
    });

    it('should submit register request to backend and close on success', () => {
      component.name.set('Jane Smith');
      component.email.set('jane@example.com');
      component.phoneNumber.set('1234567890');
      component.password.set('password123');
      component.confirmPassword.set('password123');
      fixture.detectChanges();

      component.onSubmit();

      const req = httpTesting.expectOne('http://localhost:8080/api/v1/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        name: 'Jane Smith',
        email: 'jane@example.com',
        mobileNumber: '1234567890',
        password: 'password123',
      });

      req.flush({
        success: true,
        message: 'Registration successful',
        data: {
          accessToken: 'mock-jwt-token-2',
          user: {
            id: '2',
            name: 'Jane Smith',
            email: 'jane@example.com',
          },
        },
      });

      expect(authService.currentUser()?.name).toBe('Jane Smith');
      expect(authModalService.isOpen()).toBe(false);
    });
  });

  it('should switch between login and register modes', () => {
    authModalService.openLogin();
    fixture.detectChanges();
    expect(authModalService.mode()).toBe('login');

    component.switchMode('register');
    fixture.detectChanges();
    expect(authModalService.mode()).toBe('register');

    const nameInput = fixture.nativeElement.querySelector('#auth-name');
    expect(nameInput).toBeTruthy();
  });

  it('should close when close button is clicked', () => {
    authModalService.openLogin();
    fixture.detectChanges();

    const closeBtn = fixture.nativeElement.querySelector('button[aria-label="Close modal"]');
    expect(closeBtn).toBeTruthy();
    closeBtn.click();
    fixture.detectChanges();

    expect(authModalService.isOpen()).toBe(false);
  });
});
