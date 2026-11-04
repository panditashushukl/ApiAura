import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';
import { AuthModalService } from '../../core/services/auth-modal.service';
import { AuthService } from '../../core/services/auth.service';
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

  readonly userMenuOpen = signal(false);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.userMenuOpen.set(false);
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

  logout(): void {
    this.userMenuOpen.set(false);
    this.authService.logout();
  }
}
