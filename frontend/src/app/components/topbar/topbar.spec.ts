import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TopbarComponent } from './topbar';
import { ThemeService } from '../../core/services/theme.service';
import { AuthModalService } from '../../core/services/auth-modal.service';
import { AuthService } from '../../core/services/auth.service';

describe('TopbarComponent', () => {
  let themeService: ThemeService;
  let authModalService: AuthModalService;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopbarComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    themeService = TestBed.inject(ThemeService);
    authModalService = TestBed.inject(AuthModalService);
    authService = TestBed.inject(AuthService);
  });

  it('should create topbar component', () => {
    const fixture = TestBed.createComponent(TopbarComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render brand name, login, and signup buttons when not authenticated', () => {
    authService.currentUser.set(null);
    const fixture = TestBed.createComponent(TopbarComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Api');
    expect(el.textContent).toContain('Aura');
    expect(el.textContent).toContain('Login');
    expect(el.textContent).toContain('Signup');
  });

  it('should toggle theme on button click', () => {
    const fixture = TestBed.createComponent(TopbarComponent);
    fixture.detectChanges();
    const initialMode = themeService.isDark();

    const toggleBtn = fixture.nativeElement.querySelector('button[title="Toggle theme"]');
    expect(toggleBtn).toBeTruthy();
    toggleBtn.click();
    fixture.detectChanges();

    expect(themeService.isDark()).toBe(!initialMode);
  });

  it('should open login modal when login button is clicked', () => {
    authService.currentUser.set(null);
    const fixture = TestBed.createComponent(TopbarComponent);
    fixture.detectChanges();

    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    ) as HTMLButtonElement[];
    const loginBtn = buttons.find((btn) => btn.textContent?.includes('Login'));
    expect(loginBtn).toBeTruthy();

    loginBtn?.click();
    fixture.detectChanges();

    expect(authModalService.isOpen()).toBe(true);
    expect(authModalService.mode()).toBe('login');
  });

  it('should open register modal when signup button is clicked', () => {
    authService.currentUser.set(null);
    const fixture = TestBed.createComponent(TopbarComponent);
    fixture.detectChanges();

    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    ) as HTMLButtonElement[];
    const signupBtn = buttons.find((btn) => btn.textContent?.includes('Signup'));
    expect(signupBtn).toBeTruthy();

    signupBtn?.click();
    fixture.detectChanges();

    expect(authModalService.isOpen()).toBe(true);
    expect(authModalService.mode()).toBe('register');
  });

  describe('Authenticated state (User signed in)', () => {
    it('should show round circle with first name in place of login and signup buttons', () => {
      authService.currentUser.set({
        id: '123',
        name: 'Shukla Ji',
        email: 'shukla@example.com',
      });
      const fixture = TestBed.createComponent(TopbarComponent);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      // Login and Signup should not be present
      expect(el.textContent).not.toContain('Login');
      expect(el.textContent).not.toContain('Signup');

      // Round circle avatar button should be present with first name 'Shukla'
      const avatarBtn = el.querySelector(
        'button[aria-label="User account menu"]',
      ) as HTMLButtonElement;
      expect(avatarBtn).toBeTruthy();
      expect(avatarBtn.textContent?.trim()).toBe('Shukla');
      expect(avatarBtn.classList.contains('rounded-full')).toBe(true);
    });

    it('should open dropdown menu on circle click and allow sign out', () => {
      authService.currentUser.set({
        id: '123',
        name: 'Alex Johnson',
        email: 'alex@example.com',
      });
      const fixture = TestBed.createComponent(TopbarComponent);
      fixture.detectChanges();

      const avatarBtn = fixture.nativeElement.querySelector(
        'button[aria-label="User account menu"]',
      ) as HTMLButtonElement;
      expect(avatarBtn.textContent?.trim()).toBe('Alex');

      avatarBtn.click();
      fixture.detectChanges();

      const dropdown = fixture.nativeElement.querySelector('.absolute.right-0');
      expect(dropdown).toBeTruthy();
      expect(dropdown.textContent).toContain('Alex Johnson');
      expect(dropdown.textContent).toContain('alex@example.com');
      expect(dropdown.textContent).toContain('Sign out');

      // Click sign out
      const signOutBtn = Array.from(dropdown.querySelectorAll('button')) as HTMLButtonElement[];
      const logoutBtn = signOutBtn.find((b) => b.textContent?.includes('Sign out'));
      expect(logoutBtn).toBeTruthy();
      logoutBtn?.click();
      fixture.detectChanges();

      expect(authService.currentUser()).toBeNull();
    });

    it('should display current organisation name at left side after brand name', () => {
      authService.currentUser.set({
        id: '123',
        name: 'Alex Johnson',
        email: 'alex@example.com',
        organizationName: 'ApiAura Labs',
      });
      const fixture = TestBed.createComponent(TopbarComponent);
      fixture.detectChanges();

      const orgBadge = fixture.nativeElement.querySelector('#topbar-current-org-name');
      expect(orgBadge).toBeTruthy();
      expect(orgBadge.textContent).toContain('ApiAura Labs');
    });

    it('should NOT display organisation when organisation is null', () => {
      authService.currentUser.set({
        id: '123',
        name: 'Alex Johnson',
        email: 'alex@example.com',
        organizationName: undefined,
      });
      const fixture = TestBed.createComponent(TopbarComponent);
      fixture.detectChanges();

      const orgBadge = fixture.nativeElement.querySelector('#topbar-current-org-name');
      expect(orgBadge).toBeNull();
    });

    it('should render switcher and allow switching when user has multiple organisations', () => {
      authService.currentUser.set({
        id: '123',
        name: 'Alex Johnson',
        email: 'alex@example.com',
        organizationId: 'org-1',
        organizationName: 'Primary Org',
        organizations: [
          { id: 'org-1', name: 'Primary Org', slug: 'primary-org' },
          { id: 'org-2', name: 'Secondary Org', slug: 'secondary-org' },
        ],
      });
      authService.userOrganizations.set([
        { id: 'org-1', name: 'Primary Org', slug: 'primary-org' },
        { id: 'org-2', name: 'Secondary Org', slug: 'secondary-org' },
      ]);

      const fixture = TestBed.createComponent(TopbarComponent);
      fixture.detectChanges();

      const switcherBtn = fixture.nativeElement.querySelector('#btn-org-switcher');
      expect(switcherBtn).toBeTruthy();
      expect(switcherBtn.textContent).toContain('Primary Org');

      // Click to open dropdown
      switcherBtn.click();
      fixture.detectChanges();

      const dropdown = fixture.nativeElement.querySelector('#org-switcher-dropdown');
      expect(dropdown).toBeTruthy();
      expect(dropdown.textContent).toContain('Secondary Org');

      // Click to switch
      const switchSpy = vi.spyOn(authService, 'switchOrganization');
      const buttons = Array.from(dropdown.querySelectorAll('button')) as HTMLButtonElement[];
      const secondOrgBtn = buttons.find((b) => b.textContent?.includes('Secondary Org'));
      expect(secondOrgBtn).toBeTruthy();
      secondOrgBtn?.click();
      fixture.detectChanges();

      expect(switchSpy).toHaveBeenCalledWith({
        id: 'org-2',
        name: 'Secondary Org',
        slug: 'secondary-org',
      });
    });
  });
});
