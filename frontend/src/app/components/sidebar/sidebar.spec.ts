import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { SidebarComponent } from './sidebar';
import { AuthService } from '../../core/services/auth.service';

describe('SidebarComponent', () => {
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    authService = TestBed.inject(AuthService);
  });

  it('should create sidebar component', () => {
    const fixture = TestBed.createComponent(SidebarComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render an aside skeleton element', () => {
    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();
    const aside = fixture.nativeElement.querySelector('aside');
    expect(aside).toBeTruthy();
  });

  it('should NOT display Admin navigation option when user is not an admin', () => {
    authService.currentUser.set({
      id: 'u-1',
      name: 'Regular User',
      email: 'user@example.com',
      roles: ['GUEST'],
    });

    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();

    const adminLink = fixture.nativeElement.querySelector('#sidebar-admin-link');
    expect(adminLink).toBeNull();
  });

  it('should display Admin navigation option when user is an admin', () => {
    authService.currentUser.set({
      id: 'u-admin',
      name: 'Admin User',
      email: 'admin@example.com',
      roles: ['ADMIN'],
    });

    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();

    const adminLink = fixture.nativeElement.querySelector('#sidebar-admin-link');
    expect(adminLink).toBeTruthy();
    expect(adminLink.textContent).toContain('Admin');
  });

  it('should NOT display Admin navigation option when user logs out', () => {
    authService.currentUser.set({
      id: 'u-admin',
      name: 'Admin User',
      email: 'admin@example.com',
      roles: ['ADMIN'],
    });

    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#sidebar-admin-link')).toBeTruthy();

    // User logs out
    authService.logout();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#sidebar-admin-link')).toBeNull();
  });

  it('should NOT display organisation info in sidebar (relocated to topbar)', () => {
    authService.currentUser.set({
      id: 'u-admin',
      name: 'Admin User',
      email: 'admin@example.com',
      organizationName: 'ApiAura Labs',
      roles: ['ADMIN'],
    });

    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();

    const aside = fixture.nativeElement.querySelector('aside');
    expect(aside.textContent).not.toContain('ApiAura Labs');
  });
});
