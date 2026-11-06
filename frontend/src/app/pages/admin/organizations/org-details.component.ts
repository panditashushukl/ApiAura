import { Component, input, model, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AdminOrganization,
  AdminRole,
  AdminUser,
  OrganizationInvitation,
} from '../../../core/models/admin.models';

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
  readonly invitations = input<OrganizationInvitation[]>([]);
  readonly isSuperAdmin = input<boolean>(false);

  readonly assignSearch = model<string>('');
  readonly selectedUser = model<AdminUser | null>(null);
  readonly selectedRoleId = model<string>('');
  readonly isLoading = input<boolean>(false);
  readonly copiedId = input<boolean>(false);

  readonly assignUser = output<void>();
  readonly removeUser = output<AdminUser>();
  readonly changeRole = output<{ user: AdminUser; roleId: string }>();
  readonly sendInvitation = output<{ email: string; roleId?: string; roleCode?: string }>();
  readonly cancelInvitation = output<string>();
  readonly copyId = output<string>();
  readonly close = output<void>();

  readonly dropdownOpen = signal<boolean>(false);

  // Invite member form state
  readonly inviteEmail = signal<string>('');
  readonly inviteRoleId = signal<string>('');
  readonly copiedInviteId = signal<string | null>(null);

  getVisibleRoles(member: AdminUser): string[] {
    const roles = member.roles || [];
    if (this.isSuperAdmin()) {
      return roles;
    }
    return roles.filter((r) => r.toUpperCase() !== 'SUPER_ADMIN');
  }

  isMemberSuperAdmin(member: AdminUser): boolean {
    return (member.roles || []).some((r) => r.toUpperCase() === 'SUPER_ADMIN');
  }

  canManageMember(member: AdminUser): boolean {
    if (this.isSuperAdmin()) {
      return true;
    }
    return !this.isMemberSuperAdmin(member);
  }

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

  onInviteEmailChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.inviteEmail.set(val);
  }

  onInviteRoleChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.inviteRoleId.set(val);
  }

  submitInvite(): void {
    const email = this.inviteEmail().trim();
    if (!email) return;

    const roleId = this.inviteRoleId();
    let roleCode: string | undefined;
    if (roleId) {
      const found = this.assignableRoles().find((r) => r.id === roleId);
      roleCode = found?.code;
    }

    this.sendInvitation.emit({
      email,
      roleId: roleId || undefined,
      roleCode,
    });

    this.inviteEmail.set('');
    this.inviteRoleId.set('');
  }

  copyInvitationLink(inv: OrganizationInvitation): void {
    const url = inv.invitationUrl || (inv.token ? `${window.location.origin}/invite/accept?token=${inv.token}` : '');
    if (!url) return;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        this.copiedInviteId.set(inv.id);
        setTimeout(() => this.copiedInviteId.set(null), 2000);
      });
    }
  }
}
