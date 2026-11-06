import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthModalService, AuthMode } from '../../core/services/auth-modal.service';
import { AuthService } from '../../core/services/auth.service';
import { LogoComponent } from '../logo/logo';

@Component({
  selector: 'app-auth-modal',
  imports: [CommonModule, FormsModule, LogoComponent],
  templateUrl: './auth-modal.html',
  styleUrl: './auth-modal.css',
})
export class AuthModalComponent {
  readonly authModalService = inject(AuthModalService);
  readonly authService = inject(AuthService);

  readonly isOpen = this.authModalService.isOpen;
  readonly mode = this.authModalService.mode;
  readonly isLoading = this.authService.isLoading;
  readonly errorMessage = this.authService.errorMessage;

  // Form Fields
  name = signal('');
  email = signal('');
  phoneNumber = signal('');
  password = signal('');
  confirmPassword = signal('');

  // Password visibility controls
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  // Forgot password feedback
  forgotPasswordSent = signal(false);
  forgotPasswordMessage = signal<string | null>(null);

  // Validation: Check if passwords match in register mode
  readonly passwordsMismatch = computed(() => {
    return (
      this.mode() === 'register' &&
      this.confirmPassword().length > 0 &&
      this.password() !== this.confirmPassword()
    );
  });

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) {
      this.close();
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((visible) => !visible);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update((visible) => !visible);
  }

  switchMode(targetMode: AuthMode): void {
    this.authModalService.setMode(targetMode);
    this.authService.errorMessage.set(null);
    this.forgotPasswordSent.set(false);
    this.forgotPasswordMessage.set(null);
    this.resetVisibility();
  }

  close(): void {
    this.authModalService.close();
    this.authService.errorMessage.set(null);
    this.forgotPasswordSent.set(false);
    this.forgotPasswordMessage.set(null);
    this.resetVisibility();
  }

  private resetVisibility(): void {
    this.showPassword.set(false);
    this.showConfirmPassword.set(false);
  }

  private resetForm(): void {
    this.name.set('');
    this.email.set('');
    this.phoneNumber.set('');
    this.password.set('');
    this.confirmPassword.set('');
    this.forgotPasswordSent.set(false);
    this.forgotPasswordMessage.set(null);
    this.resetVisibility();
  }

  onSubmit(): void {
    if (this.isLoading()) {
      return;
    }

    if (this.mode() === 'forgot-password') {
      if (!this.email()) {
        return;
      }
      this.authService.forgotPassword(this.email()).subscribe({
        next: (msg) => {
          this.forgotPasswordSent.set(true);
          this.forgotPasswordMessage.set(msg);
        },
        error: () => {
          // Error message set in authService.errorMessage
        },
      });
      return;
    }

    if (this.mode() === 'login') {
      if (!this.email() || !this.password()) {
        return;
      }
      this.authService
        .login({
          email: this.email(),
          password: this.password(),
        })
        .subscribe({
          next: () => {
            this.close();
            this.resetForm();
          },
          error: () => {
            // Error message is set in authService.errorMessage
          },
        });
    } else {
      if (!this.name() || !this.email() || !this.password() || this.passwordsMismatch()) {
        return;
      }
      this.authService
        .register({
          name: this.name(),
          email: this.email(),
          mobileNumber: this.phoneNumber() || undefined,
          password: this.password(),
        })
        .subscribe({
          next: () => {
            this.close();
            this.resetForm();
          },
          error: () => {
            // Error message is set in authService.errorMessage
          },
        });
    }
  }
}
