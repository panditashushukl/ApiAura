import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserOrganizationInfo } from '../../core/models/auth.models';

export type ProfileTab = 'general' | 'security' | 'organisations';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Active Tab
  readonly activeTab = signal<ProfileTab>('general');

  // User Profile Signal
  readonly currentUser = this.authService.currentUser;
  readonly userOrganizations = this.authService.userOrganizations;

  // General Profile Edit State
  readonly name = signal<string>('');
  readonly mobileNumber = signal<string>('');
  readonly isSavingProfile = signal<boolean>(false);
  readonly profileFeedback = signal<string | null>(null);
  readonly profileError = signal<string | null>(null);

  // Password Management State
  readonly currentPassword = signal<string>('');
  readonly newPassword = signal<string>('');
  readonly confirmPassword = signal<string>('');
  readonly showCurrentPassword = signal<boolean>(false);
  readonly showNewPassword = signal<boolean>(false);
  readonly showConfirmPassword = signal<boolean>(false);
  readonly isChangingPassword = signal<boolean>(false);
  readonly passwordFeedback = signal<string | null>(null);
  readonly passwordError = signal<string | null>(null);

  // Forgot Password Trigger State
  readonly isSendingResetLink = signal<boolean>(false);
  readonly resetLinkFeedback = signal<string | null>(null);
  readonly resetLinkError = signal<string | null>(null);

  // Logout All Devices State
  readonly showLogoutAllModal = signal<boolean>(false);
  readonly isLoggingOutAll = signal<boolean>(false);

  // Organisation Creation State
  readonly showCreateOrgModal = signal<boolean>(false);
  readonly newOrgName = signal<string>('');
  readonly newOrgSlug = signal<string>('');
  readonly isCreatingOrg = signal<boolean>(false);
  readonly orgFeedback = signal<string | null>(null);
  readonly orgError = signal<string | null>(null);

  readonly passwordsMismatch = computed(() => {
    return (
      this.confirmPassword().length > 0 &&
      this.newPassword() !== this.confirmPassword()
    );
  });

  readonly isPasswordFormValid = computed(() => {
    return (
      this.currentPassword().length > 0 &&
      this.newPassword().length >= 6 &&
      this.confirmPassword().length >= 6 &&
      !this.passwordsMismatch()
    );
  });

  constructor() {
    effect(() => {
      const user = this.currentUser();
      if (user) {
        if (!this.name()) {
          this.name.set(user.name || '');
        }
        if (!this.mobileNumber()) {
          this.mobileNumber.set(user.mobileNumber || '');
        }
      }
    });
  }

  ngOnInit(): void {
    const user = this.currentUser();
    if (user) {
      this.name.set(user.name || '');
      this.mobileNumber.set(user.mobileNumber || '');
    }
    this.authService.loadUserOrganizations().subscribe();
  }

  saveProfile(): void {
    const trimmedName = this.name().trim();
    if (trimmedName.length < 2) {
      this.profileError.set('Name must be at least 2 characters long.');
      return;
    }

    this.isSavingProfile.set(true);
    this.profileFeedback.set(null);
    this.profileError.set(null);

    this.authService
      .updateProfile({
        name: trimmedName,
        mobileNumber: this.mobileNumber().trim() || undefined,
      })
      .subscribe({
        next: (updatedUser) => {
          this.isSavingProfile.set(false);
          this.profileFeedback.set('Your profile has been updated successfully.');
          this.name.set(updatedUser.name);
          this.mobileNumber.set(updatedUser.mobileNumber || '');
        },
        error: (err) => {
          this.isSavingProfile.set(false);
          this.profileError.set(err.message || 'Failed to update profile.');
        },
      });
  }

  changePassword(): void {
    if (!this.isPasswordFormValid() || this.isChangingPassword()) {
      return;
    }

    this.isChangingPassword.set(true);
    this.passwordFeedback.set(null);
    this.passwordError.set(null);

    this.authService
      .changePassword({
        currentPassword: this.currentPassword(),
        newPassword: this.newPassword(),
      })
      .subscribe({
        next: (msg) => {
          this.isChangingPassword.set(false);
          this.passwordFeedback.set(msg || 'Your password was updated successfully.');
          this.currentPassword.set('');
          this.newPassword.set('');
          this.confirmPassword.set('');
        },
        error: (err) => {
          this.isChangingPassword.set(false);
          this.passwordError.set(err.message || 'Failed to change password.');
        },
      });
  }

  sendPasswordResetLink(): void {
    const email = this.currentUser()?.email;
    if (!email || this.isSendingResetLink()) {
      return;
    }

    this.isSendingResetLink.set(true);
    this.resetLinkFeedback.set(null);
    this.resetLinkError.set(null);

    this.authService.forgotPassword(email).subscribe({
      next: (msg) => {
        this.isSendingResetLink.set(false);
        this.resetLinkFeedback.set(msg || `A password reset link was sent to ${email}.`);
      },
      error: (err) => {
        this.isSendingResetLink.set(false);
        this.resetLinkError.set(err.message || 'Failed to send reset link.');
      },
    });
  }

  logoutFromAllDevices(): void {
    if (this.isLoggingOutAll()) {
      return;
    }

    this.isLoggingOutAll.set(true);
    this.authService.logoutAll().subscribe({
      complete: () => {
        this.isLoggingOutAll.set(false);
        this.showLogoutAllModal.set(false);
      },
      error: () => {
        this.isLoggingOutAll.set(false);
        this.showLogoutAllModal.set(false);
      },
    });
  }

  onOrgNameChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.newOrgName.set(val);
    if (!this.newOrgSlug() || this.newOrgSlug() === this.slugify(this.newOrgName().slice(0, -1))) {
      this.newOrgSlug.set(this.slugify(val));
    }
  }

  onOrgSlugChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.newOrgSlug.set(this.slugify(val));
  }

  submitCreateOrg(): void {
    const name = this.newOrgName().trim();
    const slug = this.newOrgSlug().trim();

    if (name.length < 2) {
      this.orgError.set('Organisation name must be at least 2 characters long.');
      return;
    }
    if (slug.length < 2) {
      this.orgError.set('Organisation slug must be at least 2 characters long.');
      return;
    }

    this.isCreatingOrg.set(true);
    this.orgFeedback.set(null);
    this.orgError.set(null);

    this.authService.createOrganization({ name, slug }).subscribe({
      next: (createdOrg) => {
        this.isCreatingOrg.set(false);
        this.orgFeedback.set(`Organisation "${name}" created! You are now the Administrator.`);
        this.newOrgName.set('');
        this.newOrgSlug.set('');
        this.showCreateOrgModal.set(false);
      },
      error: (err) => {
        this.isCreatingOrg.set(false);
        this.orgError.set(err.message || 'Failed to create organisation.');
      },
    });
  }

  switchActiveOrg(org: UserOrganizationInfo): void {
    this.authService.switchOrganization(org).subscribe({
      next: () => {
        this.orgFeedback.set(`Switched active organisation to ${org.name}`);
      },
    });
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

