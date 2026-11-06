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
})
export class UsersListComponent implements AfterViewInit {
  readonly dataSource = input.required<MatTableDataSource<AdminUser>>();
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
}
