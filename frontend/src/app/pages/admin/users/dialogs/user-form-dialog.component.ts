import {
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminOrganization, AdminRole, AdminUser } from '../../../../core/models/admin.models';
import { MultiSelectChipPickerComponent } from '../../shared/multi-select-chip-picker.component';

@Component({
  selector: 'app-user-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MultiSelectChipPickerComponent],
  templateUrl: './user-form-dialog.component.html',
})
export class UserFormDialogComponent {
  private readonly fb = inject(FormBuilder);

  readonly isOpen = input<boolean>(false);
  readonly isEdit = input<boolean>(false);
  readonly user = input<AdminUser | null>(null);
  readonly availableOrgs = input<AdminOrganization[]>([]);
  readonly availableRoles = input<AdminRole[]>([]);
  readonly isLoading = input<boolean>(false);

  readonly submitted = output<{
    name: string;
    email: string;
    password?: string;
    mobileNumber?: string;
    orgIds: string[];
    roleIds: string[];
  }>();
  readonly cancelled = output<void>();

  readonly showPassword = signal<boolean>(false);
  readonly selectedOrgIds = signal<string[]>([]);
  readonly selectedRoleIds = signal<string[]>([]);

  readonly form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    mobileNumber: [''],
  });

  constructor() {
    effect(() => {
      const open = this.isOpen();
      const edit = this.isEdit();
      const targetUser = this.user();

      if (open) {
        if (edit && targetUser) {
          this.form.get('password')?.clearValidators();
          this.form.get('password')?.updateValueAndValidity();
          this.form.patchValue({
            name: targetUser.name || '',
            email: targetUser.email || '',
            password: '',
            mobileNumber: targetUser.mobileNumber || '',
          });

          if (targetUser.organizations && targetUser.organizations.length > 0) {
            this.selectedOrgIds.set(
              targetUser.organizations.map((o) => o.id).filter(Boolean) as string[],
            );
          } else if (targetUser.organizationId) {
            this.selectedOrgIds.set([targetUser.organizationId]);
          } else {
            this.selectedOrgIds.set([]);
          }
          this.selectedRoleIds.set([]);
        } else {
          this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
          this.form.get('password')?.updateValueAndValidity();
          this.form.reset();
          this.selectedOrgIds.set([]);
          this.selectedRoleIds.set([]);
        }
        this.showPassword.set(false);
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
      email: val.email,
      password: val.password || undefined,
      mobileNumber: val.mobileNumber || undefined,
      orgIds: this.selectedOrgIds(),
      roleIds: this.selectedRoleIds(),
    });
  }
}

