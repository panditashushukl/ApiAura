import { Component, input, model, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminOrganization, AdminRole, AdminUser } from '../../../core/models/admin.models';

@Component({
  selector: 'app-org-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './org-details.component.html',
})
export class OrgDetailsComponent {
  readonly org = input.required<AdminOrganization>();
  readonly adminUser = input<AdminUser | null>(null);
  readonly canManageMembers = input<boolean>(false);
  readonly currentMembers = input<AdminUser[]>([]);
  readonly candidateUsers = input<AdminUser[]>([]);
  readonly assignableRoles = input<AdminRole[]>([]);

  readonly assignSearch = model<string>('');
  readonly selectedUser = model<AdminUser | null>(null);
  readonly selectedRoleId = model<string>('');
  readonly isLoading = input<boolean>(false);
  readonly copiedId = input<boolean>(false);

  readonly assignUser = output<void>();
  readonly removeUser = output<AdminUser>();
  readonly changeRole = output<{ user: AdminUser; roleId: string }>();
  readonly copyId = output<string>();
  readonly close = output<void>();

  readonly dropdownOpen = signal<boolean>(false);

  selectCandidate(u: AdminUser): void {
    this.selectedUser.set(u);
    this.dropdownOpen.set(false);
    this.assignSearch.set('');
  }

  clearCandidate(): void {
    this.selectedUser.set(null);
    this.dropdownOpen.set(false);
  }

  onRoleSelect(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedRoleId.set(val);
  }

  onMemberRoleChange(user: AdminUser, event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    if (val) {
      this.changeRole.emit({ user, roleId: val });
    }
  }

  onSearchInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.assignSearch.set(val);
    this.dropdownOpen.set(true);
  }
}
