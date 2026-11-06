import { Component, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminUser } from '../../../../core/models/admin.models';

@Component({
  selector: 'app-reset-password-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    @if (isOpen() && user()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
        role="dialog"
        aria-modal="true"
        (keydown.escape)="cancelled.emit()"
      >
        <div
          class="bg-surface border border-app rounded-2xl shadow-2xl max-w-md w-full p-6 text-main animate-scale-in"
          (click)="$event.stopPropagation()"
        >
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-bhagwa-500/10 border border-bhagwa-500/20 text-bhagwa flex items-center justify-center shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-base font-bold text-main">Reset Password</h3>
              <p class="text-xs text-muted">Generate a new credential for {{ user()?.name }}.</p>
            </div>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-secondary mb-1">New Password *</label>
              <div class="relative">
                <input
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="newPassword"
                  placeholder="Minimum 6 characters"
                  class="w-full px-3 py-2 text-xs rounded-xl bg-subtle border border-app text-main placeholder-muted focus:outline-none focus:border-bhagwa-500 focus:ring-1 focus:ring-bhagwa-500/30 transition-all pr-8"
                />
                <button
                  type="button"
                  (click)="showPassword.set(!showPassword())"
                  class="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-main cursor-pointer"
                >
                  @if (showPassword()) {
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/>
                    </svg>
                  } @else {
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  }
                </button>
              </div>
              @if (form.get('newPassword')?.touched && form.get('newPassword')?.invalid) {
                <p class="text-[11px] text-rose-500 mt-1">Password must be at least 6 characters.</p>
              }
            </div>

            <div class="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                (click)="cancelled.emit()"
                [disabled]="isLoading()"
                class="px-4 py-2 text-xs font-semibold rounded-xl text-secondary hover:text-main hover:bg-subtle transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="isLoading() || form.invalid"
                class="px-5 py-2 text-xs font-semibold rounded-xl bg-bhagwa-600 hover:bg-bhagwa-700 text-white shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                @if (isLoading()) {
                  <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                }
                <span>Update Password</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class ResetPasswordDialogComponent {
  private readonly fb = inject(FormBuilder);

  readonly isOpen = input<boolean>(false);
  readonly user = input<AdminUser | null>(null);
  readonly isLoading = input<boolean>(false);

  readonly submitted = output<string>();
  readonly cancelled = output<void>();

  readonly showPassword = signal<boolean>(false);

  readonly form: FormGroup = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
  });

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.form.reset();
        this.showPassword.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitted.emit(this.form.value.newPassword);
  }
}

