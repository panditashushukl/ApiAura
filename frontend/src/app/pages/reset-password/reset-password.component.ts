import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AuthModalService } from '../../core/services/auth-modal.service';
import { LogoComponent } from '../../components/logo/logo';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, LogoComponent],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly authModalService = inject(AuthModalService);

  readonly token = signal<string>('');
  readonly newPassword = signal<string>('');
  readonly confirmPassword = signal<string>('');

  readonly showNewPassword = signal<boolean>(false);
  readonly showConfirmPassword = signal<boolean>(false);

  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isSuccess = signal<boolean>(false);

  readonly passwordsMismatch = computed(() => {
    return (
      this.confirmPassword().length > 0 &&
      this.newPassword() !== this.confirmPassword()
    );
  });

  readonly isFormValid = computed(() => {
    return (
      this.token().length > 0 &&
      this.newPassword().length >= 6 &&
      this.confirmPassword().length >= 6 &&
      !this.passwordsMismatch()
    );
  });

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const t = params.get('token') || '';
      this.token.set(t);
      if (!t) {
        this.errorMessage.set('No password reset token was provided. Please request a new link.');
      }
    });
  }

  onSubmit(): void {
    if (!this.isFormValid() || this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService
      .resetPassword({
        token: this.token(),
        newPassword: this.newPassword(),
      })
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.isSuccess.set(true);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.message || 'Failed to reset password. The link may have expired.');
        },
      });
  }

  goToLogin(): void {
    this.router.navigate(['/']).then(() => {
      this.authModalService.openLogin();
    });
  }
}

