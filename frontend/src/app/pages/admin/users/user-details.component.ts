import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminUser } from '../../../core/models/admin.models';
import { getUserOrganizations } from '../shared/admin-resource-helper';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-details.component.html',
})
export class UserDetailsComponent {
  readonly user = input.required<AdminUser>();
  readonly copiedId = input<boolean>(false);

  readonly copyId = output<string>();
  readonly close = output<void>();

  getUserOrgs(user: AdminUser): { id?: string; name: string; slug?: string }[] {
    return getUserOrganizations(user);
  }
}
