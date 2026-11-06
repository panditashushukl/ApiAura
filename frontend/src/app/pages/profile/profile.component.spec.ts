import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { ProfileComponent } from './profile.component';
import { AuthService } from '../../core/services/auth.service';
import { UserProfile } from '../../core/models/auth.models';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let authService: AuthService;

  const mockUser: UserProfile = {
    id: 'user-123',
    name: 'Ada Lovelace',
    email: 'ada@apiaura.com',
    mobileNumber: '+1 555-0199',
    organizationId: 'org-1',
    organizationName: 'ApiAura Labs',
    organizationSlug: 'apiaura-labs',
    roles: ['MEMBER'],
    permissions: [],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);

    authService.currentUser.set(mockUser);
    authService.userOrganizations.set([
      { id: 'org-1', name: 'ApiAura Labs', slug: 'apiaura-labs' },
      { id: 'org-2', name: 'Secondary Corp', slug: 'secondary-corp' },
    ]);

    fixture.detectChanges();
  });

  it('should create profile component and initialize user inputs', () => {
    expect(component).toBeTruthy();
    expect(component.name()).toBe('Ada Lovelace');
    expect(component.mobileNumber()).toBe('+1 555-0199');
  });

  it('should switch between profile tabs', () => {
    expect(component.activeTab()).toBe('general');

    component.activeTab.set('security');
    fixture.detectChanges();
    expect(component.activeTab()).toBe('security');

    component.activeTab.set('organisations');
    fixture.detectChanges();
    expect(component.activeTab()).toBe('organisations');
  });

  it('should update personal profile successfully', () => {
    const updatedUser: UserProfile = {
      ...mockUser,
      name: 'Ada King Lovelace',
      mobileNumber: '+1 555-9999',
    };

    const updateSpy = vi.spyOn(authService, 'updateProfile').mockReturnValue(of(updatedUser));

    component.name.set('Ada King Lovelace');
    component.mobileNumber.set('+1 555-9999');
    component.saveProfile();

    expect(updateSpy).toHaveBeenCalledWith({
      name: 'Ada King Lovelace',
      mobileNumber: '+1 555-9999',
    });
    expect(component.profileFeedback()).toBe('Your profile has been updated successfully.');
  });

  it('should validate password mismatch and submit password change', () => {
    component.currentPassword.set('currentPass123');
    component.newPassword.set('newSecret456');
    component.confirmPassword.set('different456');

    expect(component.passwordsMismatch()).toBe(true);
    expect(component.isPasswordFormValid()).toBe(false);

    component.confirmPassword.set('newSecret456');
    expect(component.passwordsMismatch()).toBe(false);
    expect(component.isPasswordFormValid()).toBe(true);

    const changePasswordSpy = vi
      .spyOn(authService, 'changePassword')
      .mockReturnValue(of('Password changed successfully.'));

    component.changePassword();

    expect(changePasswordSpy).toHaveBeenCalledWith({
      currentPassword: 'currentPass123',
      newPassword: 'newSecret456',
    });
    expect(component.passwordFeedback()).toBe('Password changed successfully.');
    expect(component.currentPassword()).toBe('');
    expect(component.newPassword()).toBe('');
  });

  it('should trigger forgot password reset link dispatch', () => {
    const forgotSpy = vi
      .spyOn(authService, 'forgotPassword')
      .mockReturnValue(of('Password reset link sent to your email.'));

    component.sendPasswordResetLink();

    expect(forgotSpy).toHaveBeenCalledWith('ada@apiaura.com');
    expect(component.resetLinkFeedback()).toBe('Password reset link sent to your email.');
  });

  it('should create a new organisation and assign admin role', () => {
    const newOrg = { id: 'org-new', name: 'Cloud Native Org', slug: 'cloud-native-org' };
    const createOrgSpy = vi.spyOn(authService, 'createOrganization').mockReturnValue(of(newOrg));

    component.newOrgName.set('Cloud Native Org');
    component.newOrgSlug.set('cloud-native-org');
    component.submitCreateOrg();

    expect(createOrgSpy).toHaveBeenCalledWith({
      name: 'Cloud Native Org',
      slug: 'cloud-native-org',
    });
    expect(component.orgFeedback()).toContain('Organisation "Cloud Native Org" created! You are now the Administrator.');
    expect(component.newOrgName()).toBe('');
  });

  it('should switch active organisation', () => {
    const targetOrg = { id: 'org-2', name: 'Secondary Corp', slug: 'secondary-corp' };
    const switchSpy = vi.spyOn(authService, 'switchOrganization').mockReturnValue(of({ ...mockUser, organizationId: 'org-2' }));

    component.switchActiveOrg(targetOrg);
    expect(switchSpy).toHaveBeenCalledWith(targetOrg);
    expect(component.orgFeedback()).toBe('Switched active organisation to Secondary Corp');
  });
});

