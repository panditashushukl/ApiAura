import {
  AfterViewInit,
  Component,
  ViewChild,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { AdminUser } from '../../../core/models/admin.models';
import { getUserOrganizations } from '../shared/admin-resource-helper';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatSortModule],
  templateUrl: './users-list.component.html',
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-height: 0;
        width: 100%;
      }
    `,
  ],
})
export class UsersListComponent implements AfterViewInit {
  readonly dataSource = input.required<MatTableDataSource<AdminUser>>();
  readonly isSuperAdmin = input<boolean>(false);
  readonly displayedColumns = input<string[]>([
    'name',
    'email',
    'organization',
    'roles',
    'status',
    'actions',
  ]);

  readonly viewDetails = output<AdminUser>();
  readonly editUser = output<AdminUser>();
  readonly toggleStatus = output<AdminUser>();
  readonly manageRoles = output<AdminUser>();
  readonly resetPassword = output<AdminUser>();
  readonly deleteUser = output<AdminUser>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit(): void {
    if (this.dataSource()) {
      this.dataSource().paginator = this.paginator;
      this.dataSource().sort = this.sort;
    }
  }

  getUserOrgs(user: AdminUser): { id?: string; name: string; slug?: string }[] {
    return getUserOrganizations(user);
  }

  getVisibleRoles(user: AdminUser): string[] {
    const roles = user.roles || [];
    if (this.isSuperAdmin()) {
      return roles;
    }
    return roles.filter((r) => r.toUpperCase() !== 'SUPER_ADMIN');
  }

  isUserSuperAdmin(user: AdminUser): boolean {
    return (user.roles || []).some((r) => r.toUpperCase() === 'SUPER_ADMIN');
  }

  canShowUserActions(user: AdminUser): boolean {
    if (this.isSuperAdmin()) {
      return true;
    }
    return !this.isUserSuperAdmin(user);
  }
}
