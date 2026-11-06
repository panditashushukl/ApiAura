import { Component, ElementRef, HostListener, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';
import { AuthModalService } from '../../core/services/auth-modal.service';
import { AuthService } from '../../core/services/auth.service';
import { UserOrganizationInfo } from '../../core/models/auth.models';
import { LogoComponent } from '../logo/logo';

@Component({
  selector: 'app-topbar',
  imports: [CommonModule, LogoComponent],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class TopbarComponent {
  private readonly elementRef = inject(ElementRef);
  private readonly themeService = inject(ThemeService);
  private readonly authModalService = inject(AuthModalService);
  readonly authService = inject(AuthService);

  readonly isDark = this.themeService.isDark;
  readonly currentUser = this.authService.currentUser;
  readonly firstName = this.authService.firstName;

  readonly currentOrgName = computed(() => {
    const user = this.currentUser();
    return user?.organizationName || null;
  });

  readonly userOrganizations = computed<UserOrganizationInfo[]>(() => {
    const fromAuth = this.authService.userOrganizations();
    if (fromAuth && fromAuth.length > 0) {
      return fromAuth;
    }
    const fromUser = this.currentUser()?.organizations;
    if (fromUser && fromUser.length > 0) {
      return fromUser;
    }
    const current = this.currentUser();
    if (current?.organizationName && current?.organizationId) {
      return [
        {
          id: current.organizationId,
          name: current.organizationName,
          slug: current.organizationSlug || '',
        },
      ];
    }
    return [];
  });

  readonly hasMultipleOrgs = computed(() => this.userOrganizations().length > 1);

  readonly userMenuOpen = signal(false);
  readonly orgMenuOpen = signal(false);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.userMenuOpen.set(false);
      this.orgMenuOpen.set(false);
    }
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  openLogin(): void {
    this.authModalService.openLogin();
  }

  openRegister(): void {
    this.authModalService.openRegister();
  }

  toggleUserMenu(): void {
    this.userMenuOpen.update((open) => !open);
  }

  toggleOrgMenu(): void {
    this.orgMenuOpen.update((open) => !open);
  }

  closeOrgMenu(): void {
    this.orgMenuOpen.set(false);
  }

  switchOrganization(org: UserOrganizationInfo): void {
    this.authService.switchOrganization(org).subscribe();
    this.orgMenuOpen.set(false);
  }

  logout(): void {
    this.userMenuOpen.set(false);
    this.orgMenuOpen.set(false);
    this.authService.logout();
  }
}
