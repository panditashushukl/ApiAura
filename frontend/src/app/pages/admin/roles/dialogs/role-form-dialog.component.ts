import { Component, effect, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminRole } from '../../../../core/models/admin.models';

@Component({
  selector: 'app-role-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    @if (isOpen()) {
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
          <div class="flex items-center justify-between pb-3 mb-4 border-b border-app">
            <div>
              <h3 class="text-base font-bold text-main">
                {{ isEdit() ? 'Edit Role' : 'Create Security Role' }}
              </h3>
              <p class="text-xs text-muted">
                {{ isEdit() ? 'Modify display name and description.' : 'Define a new RBAC role with unique security code.' }}
              </p>
            </div>
            <button
              type="button"
              (click)="cancelled.emit()"
              class="p-1.5 rounded-lg text-muted hover:text-main hover:bg-subtle transition-colors cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-secondary mb-1">Role Name *</label>
              <input
                type="text"
                formControlName="name"
                placeholder="e.g. API Reviewer"
                class="w-full px-3 py-2 text-xs rounded-xl bg-subtle border border-app text-main placeholder-muted focus:outline-none focus:border-bhagwa-500 focus:ring-1 focus:ring-bhagwa-500/30 transition-all"
              />
              @if (form.get('name')?.touched && form.get('name')?.invalid) {
                <p class="text-[11px] text-rose-500 mt-1">Role name is required.</p>
              }
            </div>

            @if (!isEdit()) {
              <div>
                <label class="block text-xs font-semibold text-secondary mb-1">Role Code *</label>
                <input
                  type="text"
                  formControlName="code"
                  placeholder="e.g. API_REVIEWER"
                  class="w-full px-3 py-2 text-xs rounded-xl bg-subtle border border-app text-main placeholder-muted focus:outline-none focus:border-bhagwa-500 focus:ring-1 focus:ring-bhagwa-500/30 transition-all font-mono uppercase"
                />
                @if (form.get('code')?.touched && form.get('code')?.invalid) {
                  <p class="text-[11px] text-rose-500 mt-1">Role code is required.</p>
                }
              </div>
            }

            <div>
              <label class="block text-xs font-semibold text-secondary mb-1">Description (Optional)</label>
              <textarea
                formControlName="description"
                rows="3"
                placeholder="Briefly state permissions and responsibilities"
                class="w-full px-3 py-2 text-xs rounded-xl bg-subtle border border-app text-main placeholder-muted focus:outline-none focus:border-bhagwa-500 focus:ring-1 focus:ring-bhagwa-500/30 transition-all resize-none"
              ></textarea>
            </div>

            <div class="flex items-center justify-end gap-3 pt-3 border-t border-app">
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
                <span>{{ isEdit() ? 'Update Role' : 'Create Role' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class RoleFormDialogComponent {
  private readonly fb = inject(FormBuilder);

  readonly isOpen = input<boolean>(false);
  readonly isEdit = input<boolean>(false);
  readonly role = input<AdminRole | null>(null);
  readonly isLoading = input<boolean>(false);

  readonly submitted = output<{ name: string; code?: string; description?: string }>();
  readonly cancelled = output<void>();

  readonly form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    code: [''],
    description: ['', [Validators.maxLength(500)]],
  });

  constructor() {
    effect(() => {
      const open = this.isOpen();
      const edit = this.isEdit();
      const r = this.role();

      if (open) {
        if (edit && r) {
          this.form.get('code')?.clearValidators();
          this.form.patchValue({
            name: r.name,
            code: r.code,
            description: r.description || '',
          });
        } else {
          this.form.get('code')?.setValidators([Validators.required, Validators.maxLength(100)]);
          this.form.reset();
        }
        this.form.get('code')?.updateValueAndValidity();
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const val = this.form.value;
    this.submitted.emit({
      name: val.name,
      code: val.code ? val.code.toUpperCase().trim() : undefined,
      description: val.description || undefined,
    });
  }
}

