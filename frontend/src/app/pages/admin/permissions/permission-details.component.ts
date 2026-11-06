import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminPermission } from '../../../core/models/admin.models';

@Component({
  selector: 'app-permission-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './permission-details.component.html',
})
export class PermissionDetailsComponent {
  readonly permission = input.required<AdminPermission>();
  readonly copiedId = input<boolean>(false);

  readonly copyId = output<string>();
  readonly close = output<void>();
}
