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
import { AdminPermission } from '../../../core/models/admin.models';

@Component({
  selector: 'app-permissions-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatSortModule],
  templateUrl: './permissions-list.component.html',
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
export class PermissionsListComponent implements AfterViewInit {
  readonly dataSource = input.required<MatTableDataSource<AdminPermission>>();
  readonly displayedColumns = input<string[]>([
    'name',
    'code',
    'resource',
    'action',
    'actions',
  ]);

  readonly viewDetails = output<AdminPermission>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit(): void {
    if (this.dataSource()) {
      this.dataSource().paginator = this.paginator;
      this.dataSource().sort = this.sort;
    }
  }
}
