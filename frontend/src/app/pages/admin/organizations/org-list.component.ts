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
import { AdminOrganization, AdminUser } from '../../../core/models/admin.models';
import { getOrgAdmin } from '../shared/admin-resource-helper';

@Component({
  selector: 'app-org-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatSortModule],
  templateUrl: './org-list.component.html',
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
export class OrgListComponent implements AfterViewInit {
  readonly dataSource = input.required<MatTableDataSource<AdminOrganization>>();
  readonly allUsers = input<AdminUser[]>([]);
  readonly displayedColumns = input<string[]>(['name', 'slug', 'admin', 'actions']);

  readonly viewDetails = output<AdminOrganization>();
  readonly editOrg = output<AdminOrganization>();
  readonly deleteOrg = output<AdminOrganization>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit(): void {
    if (this.dataSource()) {
      this.dataSource().paginator = this.paginator;
      this.dataSource().sort = this.sort;
    }
  }

  getAdmin(org: AdminOrganization): AdminUser | null {
    return getOrgAdmin(org, this.allUsers());
  }
}
