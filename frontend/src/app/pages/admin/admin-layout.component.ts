import { Component, computed, input, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminSlice } from './shared/admin-resource-helper';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-layout.component.html',
})
export class AdminLayoutComponent {
  readonly activeSlice = model<AdminSlice>('users');
  readonly searchQuery = model<string>('');
  readonly userStatusFilter = model<string>('ALL');
  readonly roleTypeFilter = model<string>('ALL');
  readonly permissionResourceFilter = model<string>('ALL');

  readonly uniqueResources = input<string[]>([]);
  readonly feedbackMessage = input<string | null>(null);
  readonly errorMessage = input<string | null>(null);
  readonly isLoading = input<boolean>(false);
  readonly showDetailsView = input<boolean>(false);

  readonly refresh = output<void>();
  readonly createAction = output<void>();
  readonly dismissAlert = output<'feedback' | 'error'>();

  readonly searchPlaceholder = computed(() => {
    switch (this.activeSlice()) {
      case 'users':
        return 'Filter users by name or email...';
      case 'roles':
        return 'Filter roles by name or code...';
      case 'permissions':
        return 'Filter permissions by code or resource...';
      case 'organizations':
        return 'Filter organisations by name or slug...';
    }
  });

  readonly createButtonLabel = computed(() => {
    switch (this.activeSlice()) {
      case 'users':
        return 'Add User';
      case 'roles':
        return 'Add Role';
      case 'organizations':
        return 'Add Organisation';
      default:
        return '';
    }
  });

  onSearchChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.searchQuery.set(val);
  }

  onUserStatusChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.userStatusFilter.set(val);
  }

  onRoleTypeChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.roleTypeFilter.set(val);
  }

  onPermissionResourceChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.permissionResourceFilter.set(val);
  }
}

