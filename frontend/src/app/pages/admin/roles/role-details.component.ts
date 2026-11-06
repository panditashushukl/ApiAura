import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminPermission, AdminRole } from '../../../core/models/admin.models';

@Component({
  selector: 'app-role-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './role-details.component.html',
})
export class RoleDetailsComponent {
  readonly role = input.required<AdminRole>();
  readonly groupedPermissions = input<{ resource: string; displayName: string; permissions: AdminPermission[] }[]>([]);
  readonly isLoading = input<boolean>(false);
  readonly copiedId = input<boolean>(false);

  readonly copyId = output<string>();
  readonly close = output<void>();
}
