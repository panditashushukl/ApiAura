import {
  Component,
  OnInit,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { forkJoin } from 'rxjs';
import { AdminService } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';
import {
  AdminOrganization,
  AdminPermission,
  AdminRole,
  AdminUser,
  UserStatus,
} from '../../core/models/admin.models';

import {
  AdminSlice,
  DetailType,
  DeleteTarget,
  PermissionGroup,
  formatResourceTitle,
  getResourceDescription,
  groupPermissionsByResource,
  groupRoleDetailPermissions,
  getOrgAdmin,
  getUserOrganizations,
} from './shared/admin-resource-helper';

import { AdminLayoutComponent } from './admin-layout.component';
import { UsersListComponent } from './users/users-list.component';
import { UserDetailsComponent } from './users/user-details.component';
import { UserFormDialogComponent } from './users/dialogs/user-form-dialog.component';
import { ResetPasswordDialogComponent } from './users/dialogs/reset-password-dialog.component';
import { ManageRolesDialogComponent } from './users/dialogs/manage-roles-dialog.component';
import { RolesListComponent } from './roles/roles-list.component';
import { RoleDetailsComponent } from './roles/role-details.component';
import { RoleFormDialogComponent } from './roles/dialogs/role-form-dialog.component';
import { RolePermissionsDialogComponent } from './roles/dialogs/role-permissions-dialog.component';
import { PermissionsListComponent } from './permissions/permissions-list.component';
import { PermissionDetailsComponent } from './permissions/permission-details.component';
import { OrgListComponent } from './organizations/org-list.component';
import { OrgDetailsComponent } from './organizations/org-details.component';
import { OrgFormDialogComponent } from './organizations/dialogs/org-form-dialog.component';
import { DeleteConfirmDialogComponent } from './shared/delete-confirm-dialog.component';

export type { AdminSlice, DetailType, PermissionGroup };

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AdminLayoutComponent,
    UsersListComponent,
    UserDetailsComponent,
    UserFormDialogComponent,
    ResetPasswordDialogComponent,
    ManageRolesDialogComponent,
    RolesListComponent,
    RoleDetailsComponent,
    RoleFormDialogComponent,
    RolePermissionsDialogComponent,
    PermissionsListComponent,
    PermissionDetailsComponent,
    OrgListComponent,
    OrgDetailsComponent,
    OrgFormDialogComponent,
    DeleteConfirmDialogComponent,
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class AdminComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  protected readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  constructor() {
    effect(() => {
      if (!this.authService.isAdmin()) {
        this.clearAllAdminData();
        this.router.navigate(['/']);
      }
    });
  }

  // Active slice tab
  readonly activeSlice = signal<AdminSlice>('users');

  // Loading and feedback states
  readonly isLoading = signal<boolean>(false);
  readonly feedbackMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  // Filters
  readonly searchFilter = signal<string>('');
  readonly userStatusFilter = signal<string>('ALL');
  readonly roleTypeFilter = signal<string>('ALL');
  readonly permissionResourceFilter = signal<string>('ALL');

  // Raw data lists
  readonly users = signal<AdminUser[]>([]);
  readonly roles = signal<AdminRole[]>([]);
  readonly permissions = signal<AdminPermission[]>([]);
  readonly organizations = signal<AdminOrganization[]>([]);

  // Unique resources for permission filter
  readonly uniqueResources = computed(() => {
    const list = this.permissions().map((p) => p.resource).filter(Boolean);
    return Array.from(new Set(list)).sort();
  });

  // Table Data Sources
  readonly usersDataSource = new MatTableDataSource<AdminUser>([]);
  readonly rolesDataSource = new MatTableDataSource<AdminRole>([]);
  readonly permissionsDataSource = new MatTableDataSource<AdminPermission>([]);
  readonly organizationsDataSource = new MatTableDataSource<AdminOrganization>([]);

  // MatPaginators and MatSorts
  @ViewChild('usersPaginator') usersPaginator!: MatPaginator;
  @ViewChild('usersSort') usersSort!: MatSort;
  @ViewChild('rolesPaginator') rolesPaginator!: MatPaginator;
  @ViewChild('rolesSort') rolesSort!: MatSort;
  @ViewChild('permissionsPaginator') permissionsPaginator!: MatPaginator;
  @ViewChild('permissionsSort') permissionsSort!: MatSort;
  @ViewChild('orgsPaginator') orgsPaginator!: MatPaginator;
  @ViewChild('orgsSort') orgsSort!: MatSort;

  // Active Target for Role or Permission Management Modals
  readonly selectedUser = signal<AdminUser | null>(null);
  readonly selectedUserRoles = signal<AdminRole[]>([]);
  readonly selectedRole = signal<AdminRole | null>(null);
  readonly selectedRolePermissions = signal<AdminPermission[]>([]);

  // Modals state
  readonly showCreateUserModal = signal<boolean>(false);
  readonly showEditUserModal = signal<boolean>(false);
  readonly showUserRolesModal = signal<boolean>(false);
  readonly showResetPasswordModal = signal<boolean>(false);
  readonly showPasswordText = signal<boolean>(false);
  readonly showCreateUserPassword = signal<boolean>(false);

  readonly showCreateRoleModal = signal<boolean>(false);
  readonly showEditRoleModal = signal<boolean>(false);
  readonly showRolePermissionsModal = signal<boolean>(false);

  readonly showCreatePermissionModal = signal<boolean>(false);

  readonly showCreateOrgModal = signal<boolean>(false);
  readonly showEditOrgModal = signal<boolean>(false);
  readonly selectedOrg = signal<AdminOrganization | null>(null);

  readonly showDeleteModal = signal<boolean>(false);
  readonly deleteTarget = signal<DeleteTarget | null>(null);

  // Details Dedicated Page State
  readonly showDetailsPage = signal<boolean>(false);
  readonly showDetailsPanel = this.showDetailsPage;

  readonly detailType = signal<DetailType>('user');
  readonly selectedDetailItem = signal<
    AdminUser | AdminRole | AdminPermission | AdminOrganization | null
  >(null);
  readonly roleDetailPermissions = signal<AdminPermission[]>([]);
  readonly isDetailLoading = signal<boolean>(false);
  readonly copiedId = signal<boolean>(false);

  // Search filter for grouped role permissions modal
  readonly rolePermissionSearch = signal<string>('');

  readonly grantedRolePermIds = computed(() => {
    return new Set(this.selectedRolePermissions().map((p) => p.id));
  });

  get userDetail(): AdminUser | null {
    return this.detailType() === 'user' ? (this.selectedDetailItem() as AdminUser) : null;
  }

  get roleDetail(): AdminRole | null {
    return this.detailType() === 'role' ? (this.selectedDetailItem() as AdminRole) : null;
  }

  get permissionDetail(): AdminPermission | null {
    return this.detailType() === 'permission'
      ? (this.selectedDetailItem() as AdminPermission)
      : null;
  }

  get orgDetail(): AdminOrganization | null {
    return this.detailType() === 'organization'
      ? (this.selectedDetailItem() as AdminOrganization)
      : null;
  }

  getOrgAdmin(org: AdminOrganization): AdminUser | null {
    return getOrgAdmin(org, this.users());
  }

  getUserOrganizations(user: AdminUser | null | undefined): { id?: string; name: string; slug?: string }[] {
    return getUserOrganizations(user);
  }

  readonly orgAdminUser = computed<AdminUser | null>(() => {
    return this.orgDetail ? this.getOrgAdmin(this.orgDetail) : null;
  });

  // --- Organisation Member Assignment & Role Management ---
  readonly assignUserSearch = signal<string>('');
  readonly assignUserDropdownOpen = signal<boolean>(false);
  readonly selectedAssignUser = signal<AdminUser | null>(null);
  readonly selectedAssignRoleId = signal<string>('');

  readonly canManageMembers = computed(() => {
    if (this.authService.isSuperAdmin()) {
      return true;
    }
    const currentOrgId = this.authService.currentUser()?.organizationId;
    const targetOrg = this.orgDetail;
    return !!(currentOrgId && targetOrg && currentOrgId === targetOrg.id && this.authService.isAdmin());
  });

  readonly canManageOrgMembers = this.canManageMembers;

  readonly currentOrgMembers = computed<AdminUser[]>(() => {
    const org = this.orgDetail;
    if (!org) return [];
    return this.users().filter((u) => u.organizationId === org.id);
  });

  readonly candidateUsersForOrg = computed<AdminUser[]>(() => {
    const org = this.orgDetail;
    if (!org) return [];
    const query = this.assignUserSearch().toLowerCase().trim();
    return this.users().filter((u) => {
      if (u.organizationId === org.id) return false;
      if (!query) return true;
      const matchName = (u.name || '').toLowerCase().includes(query);
      const matchEmail = (u.email || '').toLowerCase().includes(query);
      const matchPhone = (u.mobileNumber || '').toLowerCase().includes(query);
      return matchName || matchEmail || matchPhone;
    });
  });

  readonly assignableRoles = computed<AdminRole[]>(() => {
    const isSuper = this.authService.isSuperAdmin();
    const allRoles = this.roles();
    if (isSuper) return allRoles;
    return allRoles.filter((r) => r.code?.toUpperCase() !== 'SUPER_ADMIN');
  });

  readonly orgAdminAvailableOrganizations = computed<AdminOrganization[]>(() => {
    const isSuper = this.authService.isSuperAdmin();
    if (isSuper) return this.organizations();
    const currentOrgId = this.authService.currentUser()?.organizationId;
    return this.organizations().filter((o) => o.id === currentOrgId);
  });

  getOrgById(orgId: string): AdminOrganization | undefined {
    return this.organizations().find((o) => o.id === orgId);
  }

  getRoleById(roleId: string): AdminRole | undefined {
    return this.roles().find((r) => r.id === roleId);
  }

  // --- Edit User Multi-Organisation Selection ---
  readonly editUserSelectedOrgIds = signal<string[]>([]);
  readonly editUserOrgSearch = signal<string>('');

  readonly editUserAvailableOrgs = computed<AdminOrganization[]>(() => {
    const isSuper = this.authService.isSuperAdmin();
    const sourceOrgs = isSuper ? this.organizations() : this.orgAdminAvailableOrganizations();
    const query = this.editUserOrgSearch().toLowerCase().trim();
    if (!query) return sourceOrgs;
    return sourceOrgs.filter((o) =>
      (o.name || '').toLowerCase().includes(query) ||
      (o.slug || '').toLowerCase().includes(query)
    );
  });

  toggleEditUserOrg(orgId: string): void {
    this.editUserSelectedOrgIds.update((ids) => {
      if (ids.includes(orgId)) {
        return ids.filter((id) => id !== orgId);
      } else {
        return [...ids, orgId];
      }
    });
  }

  removeEditUserOrg(orgId: string): void {
    this.editUserSelectedOrgIds.update((ids) => ids.filter((id) => id !== orgId));
  }

  isEditUserOrgSelected(orgId: string): boolean {
    return this.editUserSelectedOrgIds().includes(orgId);
  }

  // --- Create User Multi-Organisation & Multi-Role Selection ---
  readonly createUserSelectedOrgIds = signal<string[]>([]);
  readonly createUserOrgSearch = signal<string>('');

  readonly createUserAvailableOrgs = computed<AdminOrganization[]>(() => {
    const isSuper = this.authService.isSuperAdmin();
    const sourceOrgs = isSuper ? this.organizations() : this.orgAdminAvailableOrganizations();
    const query = this.createUserOrgSearch().toLowerCase().trim();
    if (!query) return sourceOrgs;
    return sourceOrgs.filter((o) =>
      (o.name || '').toLowerCase().includes(query) ||
      (o.slug || '').toLowerCase().includes(query)
    );
  });

  toggleCreateUserOrg(orgId: string): void {
    this.createUserSelectedOrgIds.update((ids) => {
      if (ids.includes(orgId)) {
        return ids.filter((id) => id !== orgId);
      } else {
        return [...ids, orgId];
      }
    });
  }

  removeCreateUserOrg(orgId: string): void {
    this.createUserSelectedOrgIds.update((ids) => ids.filter((id) => id !== orgId));
  }

  isCreateUserOrgSelected(orgId: string): boolean {
    return this.createUserSelectedOrgIds().includes(orgId);
  }

  readonly createUserSelectedRoleIds = signal<string[]>([]);
  readonly createUserRoleSearch = signal<string>('');

  readonly createUserAvailableRoles = computed<AdminRole[]>(() => {
    const sourceRoles = this.assignableRoles();
    const query = this.createUserRoleSearch().toLowerCase().trim();
    if (!query) return sourceRoles;
    return sourceRoles.filter((r) =>
      (r.name || '').toLowerCase().includes(query) ||
      (r.code || '').toLowerCase().includes(query)
    );
  });

  toggleCreateUserRole(roleId: string): void {
    this.createUserSelectedRoleIds.update((ids) => {
      if (ids.includes(roleId)) {
        return ids.filter((id) => id !== roleId);
      } else {
        return [...ids, roleId];
      }
    });
  }

  removeCreateUserRole(roleId: string): void {
    this.createUserSelectedRoleIds.update((ids) => ids.filter((id) => id !== roleId));
  }

  isCreateUserRoleSelected(roleId: string): boolean {
    return this.createUserSelectedRoleIds().includes(roleId);
  }

  formatResourceTitle(resource: string): string {
    return formatResourceTitle(resource);
  }

  getResourceDescription(resource: string): string {
    return getResourceDescription(resource);
  }

  readonly permissionGroups = computed<PermissionGroup[]>(() => {
    return groupPermissionsByResource(
      this.permissions(),
      this.selectedRolePermissions(),
      this.rolePermissionSearch(),
    );
  });

  readonly roleDetailGroupedPermissions = computed(() => {
    return groupRoleDetailPermissions(this.roleDetailPermissions());
  });

  openDetailsPage(
    type: DetailType,
    item: AdminUser | AdminRole | AdminPermission | AdminOrganization,
  ): void {
    this.detailType.set(type);
    this.selectedDetailItem.set(item);
    this.showDetailsPage.set(true);
    this.copiedId.set(false);

    if (type === 'role') {
      this.isDetailLoading.set(true);
      this.adminService.getRolePermissions(item.id).subscribe({
        next: (perms) => {
          this.roleDetailPermissions.set(perms);
          this.isDetailLoading.set(false);
        },
        error: () => {
          this.roleDetailPermissions.set([]);
          this.isDetailLoading.set(false);
        },
      });
    }
  }

  openDetailsPanel(
    type: DetailType,
    item: AdminUser | AdminRole | AdminPermission | AdminOrganization,
  ): void {
    this.openDetailsPage(type, item);
  }

  closeDetailsPage(): void {
    this.showDetailsPage.set(false);
    this.selectedDetailItem.set(null);
    this.roleDetailPermissions.set([]);
    this.copiedId.set(false);
  }

  closeDetailsPanel(): void {
    this.closeDetailsPage();
  }

  toggleGroupPermissions(group: PermissionGroup, grant: boolean): void {
    const role = this.selectedRole();
    if (!role) return;

    const currentGrantedIds = new Set(this.selectedRolePermissions().map((p) => p.id));
    const targetPerms = grant
      ? group.permissions.filter((p) => !currentGrantedIds.has(p.id))
      : group.permissions.filter((p) => currentGrantedIds.has(p.id));

    if (targetPerms.length === 0) return;

    this.isLoading.set(true);
    const requests$ = targetPerms.map((perm) =>
      grant
        ? this.adminService.grantPermissionToRole(role.id, perm.id)
        : this.adminService.revokePermissionFromRole(role.id, perm.id),
    );

    forkJoin(requests$).subscribe({
      next: () => {
        if (grant) {
          this.selectedRolePermissions.update((list) => {
            const existingIds = new Set(list.map((p) => p.id));
            const toAdd = targetPerms.filter((p) => !existingIds.has(p.id));
            return [...list, ...toAdd];
          });
          this.feedbackMessage.set(`Granted all ${group.displayName} permissions to role`);
        } else {
          const targetIds = new Set(targetPerms.map((p) => p.id));
          this.selectedRolePermissions.update((list) => list.filter((p) => !targetIds.has(p.id)));
          this.feedbackMessage.set(`Revoked all ${group.displayName} permissions from role`);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set(`Failed to update ${group.displayName} permissions for role`);
        this.isLoading.set(false);
      },
    });
  }

  copyIdToClipboard(id: string): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(id).then(() => {
        this.copiedId.set(true);
        setTimeout(() => this.copiedId.set(false), 2000);
      });
    }
  }

  // Reactive Forms for tests and dialog bindings
  readonly createUserForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    mobileNumber: [''],
    organizationId: [''],
    roleId: [''],
  });

  readonly editUserForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    mobileNumber: [''],
    organizationId: [''],
  });

  readonly resetPasswordForm: FormGroup = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
  });

  readonly createRoleForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    code: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
  });

  readonly editRoleForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
  });

  readonly createPermissionForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    code: ['', [Validators.required, Validators.maxLength(100)]],
    resource: ['', [Validators.required, Validators.maxLength(100)]],
    action: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
  });

  readonly createOrgForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
    slug: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
  });

  readonly editOrgForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
    slug: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
  });

  ngOnInit(): void {
    this.setupFilterPredicates();
    if (this.authService.isAdmin()) {
      this.fetchAllData();
    }
  }

  clearAllAdminData(): void {
    this.users.set([]);
    this.roles.set([]);
    this.permissions.set([]);
    this.organizations.set([]);
    this.usersDataSource.data = [];
    this.rolesDataSource.data = [];
    this.permissionsDataSource.data = [];
    this.organizationsDataSource.data = [];
    this.selectedUser.set(null);
    this.selectedUserRoles.set([]);
    this.selectedRole.set(null);
    this.selectedRolePermissions.set([]);
    this.selectedOrg.set(null);
    this.deleteTarget.set(null);
    this.showCreateUserModal.set(false);
    this.showEditUserModal.set(false);
    this.showUserRolesModal.set(false);
    this.showResetPasswordModal.set(false);
    this.showPasswordText.set(false);
    this.showCreateUserPassword.set(false);
    this.showCreateRoleModal.set(false);
    this.showEditRoleModal.set(false);
    this.showRolePermissionsModal.set(false);
    this.showCreatePermissionModal.set(false);
    this.showCreateOrgModal.set(false);
    this.showEditOrgModal.set(false);
    this.showDeleteModal.set(false);
    this.showDetailsPanel.set(false);
    this.selectedDetailItem.set(null);
    this.roleDetailPermissions.set([]);
    this.copiedId.set(false);
    this.rolePermissionSearch.set('');
    this.feedbackMessage.set(null);
    this.errorMessage.set(null);
  }

  private setupFilterPredicates(): void {
    this.usersDataSource.filterPredicate = (user: AdminUser, filter: string): boolean => {
      const parsed = JSON.parse(filter || '{}');
      const query = (parsed.query || '').toLowerCase().trim();
      const status = parsed.status || 'ALL';

      const matchesStatus =
        status === 'ALL' || user.status?.toUpperCase() === status.toUpperCase();

      const matchesQuery =
        !query ||
        Boolean(
          user.name?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query) ||
            user.roles?.some((r) => r.toLowerCase().includes(query)) ||
            user.organizationName?.toLowerCase().includes(query) ||
            user.organizations?.some((o) => o.name?.toLowerCase().includes(query)),
        );

      return Boolean(matchesStatus && matchesQuery);
    };

    this.rolesDataSource.filterPredicate = (role: AdminRole, filter: string): boolean => {
      const parsed = JSON.parse(filter || '{}');
      const query = (parsed.query || '').toLowerCase().trim();
      const type = parsed.type || 'ALL';

      const matchesType =
        type === 'ALL' ||
        (type === 'SYSTEM' && role.systemRole) ||
        (type === 'CUSTOM' && !role.systemRole);

      const matchesQuery =
        !query ||
        Boolean(
          role.name?.toLowerCase().includes(query) ||
            role.code?.toLowerCase().includes(query) ||
            role.description?.toLowerCase().includes(query),
        );

      return Boolean(matchesType && matchesQuery);
    };

    this.permissionsDataSource.filterPredicate = (
      perm: AdminPermission,
      filter: string,
    ): boolean => {
      const parsed = JSON.parse(filter || '{}');
      const query = (parsed.query || '').toLowerCase().trim();
      const resource = parsed.resource || 'ALL';

      const matchesResource =
        resource === 'ALL' ||
        perm.resource?.toUpperCase() === resource.toUpperCase();

      const matchesQuery =
        !query ||
        Boolean(
          perm.name?.toLowerCase().includes(query) ||
            perm.code?.toLowerCase().includes(query) ||
            perm.resource?.toLowerCase().includes(query) ||
            perm.action?.toLowerCase().includes(query) ||
            perm.description?.toLowerCase().includes(query),
        );

      return Boolean(matchesResource && matchesQuery);
    };

    this.organizationsDataSource.filterPredicate = (
      org: AdminOrganization,
      filter: string,
    ): boolean => {
      const query = (filter || '').toLowerCase().trim();
      return (
        !query ||
        Boolean(
          org.name?.toLowerCase().includes(query) ||
            org.slug?.toLowerCase().includes(query)
        )
      );
    };
  }

  setSlice(slice: AdminSlice): void {
    this.activeSlice.set(slice);
    this.searchFilter.set('');
    this.feedbackMessage.set(null);
    this.errorMessage.set(null);
    this.applyAllFilters();
  }

  fetchAllData(): void {
    this.loadUsers();
    this.loadRoles();
    this.loadPermissions();
    this.loadOrganizations();
  }

  refreshCurrentSlice(): void {
    switch (this.activeSlice()) {
      case 'users':
        this.loadUsers();
        break;
      case 'roles':
        this.loadRoles();
        break;
      case 'permissions':
        this.loadPermissions();
        break;
      case 'organizations':
        this.loadOrganizations();
        break;
    }
  }

  // --- Users Fetch & Filter ---
  loadUsers(): void {
    this.isLoading.set(true);
    this.adminService.getUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.usersDataSource.data = data;
        this.applyUsersFilter();
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to load users');
        this.isLoading.set(false);
      },
    });
  }

  private applyUsersFilter(): void {
    this.usersDataSource.filter = JSON.stringify({
      query: this.searchFilter(),
      status: this.userStatusFilter(),
    });
  }

  // --- Roles Fetch & Filter ---
  loadRoles(): void {
    this.isLoading.set(true);
    this.adminService.getRoles().subscribe({
      next: (data) => {
        this.roles.set(data);
        this.rolesDataSource.data = data;
        this.applyRolesFilter();
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to load roles');
        this.isLoading.set(false);
      },
    });
  }

  private applyRolesFilter(): void {
    this.rolesDataSource.filter = JSON.stringify({
      query: this.searchFilter(),
      type: this.roleTypeFilter(),
    });
  }

  // --- Permissions Fetch & Filter ---
  loadPermissions(): void {
    this.isLoading.set(true);
    this.adminService.getPermissions().subscribe({
      next: (data) => {
        this.permissions.set(data);
        this.permissionsDataSource.data = data;
        this.applyPermissionsFilter();
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to load permissions');
        this.isLoading.set(false);
      },
    });
  }

  private applyPermissionsFilter(): void {
    this.permissionsDataSource.filter = JSON.stringify({
      query: this.searchFilter(),
      resource: this.permissionResourceFilter(),
    });
  }

  // --- Organisations Fetch & Filter ---
  loadOrganizations(): void {
    this.isLoading.set(true);
    this.adminService.getOrganizations().subscribe({
      next: (data) => {
        this.organizations.set(data);
        this.organizationsDataSource.data = data;
        this.applyOrgsFilter();
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to load organisations');
        this.isLoading.set(false);
      },
    });
  }

  private applyOrgsFilter(): void {
    this.organizationsDataSource.filter = this.searchFilter();
  }

  applyAllFilters(): void {
    switch (this.activeSlice()) {
      case 'users':
        this.applyUsersFilter();
        break;
      case 'roles':
        this.applyRolesFilter();
        break;
      case 'permissions':
        this.applyPermissionsFilter();
        break;
      case 'organizations':
        this.applyOrgsFilter();
        break;
    }
  }

  // --- Modal Openers ---
  openCreateModal(): void {
    this.errorMessage.set(null);
    this.feedbackMessage.set(null);

    switch (this.activeSlice()) {
      case 'users':
        this.createUserForm.reset();
        this.createUserOrgSearch.set('');
        this.createUserRoleSearch.set('');
        this.showCreateUserPassword.set(false);
        if (!this.authService.isSuperAdmin() && this.authService.currentUser()?.organizationId) {
          this.createUserSelectedOrgIds.set([this.authService.currentUser()!.organizationId!]);
        } else {
          this.createUserSelectedOrgIds.set([]);
        }
        this.createUserSelectedRoleIds.set([]);
        this.showCreateUserModal.set(true);
        break;
      case 'roles':
        this.createRoleForm.reset();
        this.showCreateRoleModal.set(true);
        break;
      case 'organizations':
        this.createOrgForm.reset();
        this.showCreateOrgModal.set(true);
        break;
    }
  }

  // --- User CRUD Actions ---
  submitCreateUser(): void {
    if (this.createUserForm.invalid) {
      this.createUserForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const formVal = this.createUserForm.value;
    const orgIds = this.createUserSelectedOrgIds();
    const roleIds = this.createUserSelectedRoleIds();
    this.adminService
      .createUser({
        name: formVal.name,
        email: formVal.email,
        password: formVal.password,
        mobileNumber: formVal.mobileNumber || undefined,
        organizationId: orgIds.length > 0 ? orgIds[0] : undefined,
        organizationIds: orgIds.length > 0 ? orgIds : undefined,
        roleId: roleIds.length > 0 ? roleIds[0] : undefined,
        roleIds: roleIds.length > 0 ? roleIds : undefined,
      })
      .subscribe({
        next: () => {
          this.feedbackMessage.set('User created successfully');
          this.showCreateUserModal.set(false);
          this.loadUsers();
        },
        error: (err) => {
          this.errorMessage.set(err?.error?.message || 'Failed to create user');
          this.isLoading.set(false);
        },
      });
  }

  handleCreateUserSubmit(payload: {
    name: string;
    email: string;
    password?: string;
    mobileNumber?: string;
    orgIds: string[];
    roleIds: string[];
  }): void {
    this.createUserForm.patchValue({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      mobileNumber: payload.mobileNumber,
    });
    this.createUserSelectedOrgIds.set(payload.orgIds);
    this.createUserSelectedRoleIds.set(payload.roleIds);
    this.submitCreateUser();
  }

  selectAssignUser(user: AdminUser): void {
    this.selectedAssignUser.set(user);
    this.assignUserDropdownOpen.set(false);
    this.assignUserSearch.set('');
  }

  clearAssignUser(): void {
    this.selectedAssignUser.set(null);
    this.assignUserDropdownOpen.set(false);
    this.assignUserSearch.set('');
  }

  assignUserToCurrentOrg(): void {
    const user = this.selectedAssignUser();
    const org = this.orgDetail;
    if (!user || !org) return;

    this.isLoading.set(true);
    const roleId = this.selectedAssignRoleId();
    const roleIds = roleId ? [roleId] : undefined;

    this.adminService
      .updateUser(user.id, {
        organizationId: org.id,
        roleIds,
      })
      .subscribe({
        next: (updatedUser) => {
          this.users.update((list) =>
            list.map((u) =>
              u.id === user.id
                ? {
                    ...u,
                    organizationId: org.id,
                    organizationName: org.name,
                    organizationSlug: org.slug,
                    roles: updatedUser.roles || u.roles,
                  }
                : u,
            ),
          );
          this.selectedAssignUser.set(null);
          this.selectedAssignRoleId.set('');
          this.assignUserSearch.set('');
          this.feedbackMessage.set(`Successfully assigned ${user.name} to ${org.name}`);
          this.isLoading.set(false);
          this.loadUsers();
        },
        error: (err) => {
          this.errorMessage.set(err?.error?.message || `Failed to assign user to ${org.name}`);
          this.isLoading.set(false);
        },
      });
  }

  removeUserFromOrg(user: AdminUser): void {
    const org = this.orgDetail;
    if (!org) return;

    this.isLoading.set(true);
    this.adminService
      .updateUser(user.id, {
        clearOrganization: true,
      })
      .subscribe({
        next: () => {
          this.users.update((list) =>
            list.map((u) =>
              u.id === user.id
                ? {
                    ...u,
                    organizationId: undefined,
                    organizationName: undefined,
                    organizationSlug: undefined,
                  }
                : u,
            ),
          );
          this.feedbackMessage.set(`Removed ${user.name} from ${org.name}`);
          this.isLoading.set(false);
          this.loadUsers();
        },
        error: (err) => {
          this.errorMessage.set(err?.error?.message || `Failed to remove user from ${org.name}`);
          this.isLoading.set(false);
        },
      });
  }

  changeMemberRole(user: AdminUser, newRoleId: string): void {
    if (!newRoleId) return;
    this.isLoading.set(true);
    this.adminService.setUserRoles(user.id, [newRoleId]).subscribe({
      next: () => {
        const targetRole = this.roles().find((r) => r.id === newRoleId);
        const roleCodes = targetRole ? [targetRole.code] : [];
        this.users.update((list) =>
          list.map((u) => (u.id === user.id ? { ...u, roles: roleCodes } : u)),
        );
        this.feedbackMessage.set(
          `Updated role for ${user.name} to ${targetRole?.name || targetRole?.code}`,
        );
        this.isLoading.set(false);
        this.loadUsers();
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || `Failed to update role for ${user.name}`);
        this.isLoading.set(false);
      },
    });
  }

  openEditUser(user: AdminUser): void {
    this.selectedUser.set(user);
    this.editUserForm.patchValue({
      name: user.name,
      email: user.email,
      mobileNumber: user.mobileNumber || '',
    });

    this.editUserOrgSearch.set('');
    if (user.organizations && user.organizations.length > 0) {
      this.editUserSelectedOrgIds.set(user.organizations.map((o) => o.id));
    } else if (user.organizationId) {
      this.editUserSelectedOrgIds.set([user.organizationId]);
    } else {
      this.editUserSelectedOrgIds.set([]);
    }

    this.showEditUserModal.set(true);
  }

  submitEditUser(): void {
    const user = this.selectedUser();
    if (!user || this.editUserForm.invalid) {
      this.editUserForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const formVal = this.editUserForm.value;
    const orgIds = this.editUserSelectedOrgIds();
    const primaryOrgId = orgIds.length > 0 ? orgIds[0] : undefined;
    const clearOrg = orgIds.length === 0 && !!user.organizationId;

    this.adminService
      .updateUser(user.id, {
        name: formVal.name,
        email: formVal.email,
        mobileNumber: formVal.mobileNumber || undefined,
        organizationId: primaryOrgId,
        organizationIds: orgIds,
        clearOrganization: clearOrg,
      })
      .subscribe({
        next: () => {
          this.feedbackMessage.set('User updated successfully');
          this.showEditUserModal.set(false);
          this.loadUsers();
        },
        error: (err) => {
          this.errorMessage.set(err?.error?.message || 'Failed to update user');
          this.isLoading.set(false);
        },
      });
  }

  handleEditUserSubmit(payload: {
    name: string;
    email: string;
    mobileNumber?: string;
    orgIds: string[];
  }): void {
    this.editUserForm.patchValue({
      name: payload.name,
      email: payload.email,
      mobileNumber: payload.mobileNumber,
    });
    this.editUserSelectedOrgIds.set(payload.orgIds);
    this.submitEditUser();
  }

  openResetPasswordModal(user: AdminUser): void {
    this.selectedUser.set(user);
    this.resetPasswordForm.reset();
    this.showPasswordText.set(false);
    this.showCreateUserPassword.set(false);
    this.showResetPasswordModal.set(true);
  }

  submitResetPassword(): void {
    const user = this.selectedUser();
    if (!user || this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const newPassword = this.resetPasswordForm.value.newPassword;
    this.adminService.resetUserPassword(user.id, newPassword).subscribe({
      next: () => {
        this.feedbackMessage.set(`Password for ${user.name} created successfully`);
        this.showResetPasswordModal.set(false);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to create new password');
        this.isLoading.set(false);
      },
    });
  }

  handleResetPasswordSubmit(password: string): void {
    this.resetPasswordForm.patchValue({ newPassword: password });
    this.submitResetPassword();
  }

  toggleUserStatus(user: AdminUser): void {
    const nextStatus: UserStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    this.isLoading.set(true);
    this.adminService.updateUserStatus(user.id, nextStatus).subscribe({
      next: () => {
        this.feedbackMessage.set(`User status updated to ${nextStatus}`);
        this.loadUsers();
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to update user status');
        this.isLoading.set(false);
      },
    });
  }

  openManageUserRoles(user: AdminUser): void {
    this.selectedUser.set(user);
    this.isLoading.set(true);
    this.adminService.getUserRoles(user.id).subscribe({
      next: (userRoles) => {
        this.selectedUserRoles.set(userRoles);
        this.showUserRolesModal.set(true);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to fetch user roles');
        this.isLoading.set(false);
      },
    });
  }

  isRoleAssignedToSelectedUser(roleId: string): boolean {
    return this.selectedUserRoles().some((r) => r.id === roleId);
  }

  toggleRoleAssignment(roleId: string): void {
    const user = this.selectedUser();
    if (!user) return;

    const isAssigned = this.isRoleAssignedToSelectedUser(roleId);
    this.isLoading.set(true);

    const action$ = isAssigned
      ? this.adminService.removeRoleFromUser(user.id, roleId)
      : this.adminService.assignRoleToUser(user.id, roleId);

    action$.subscribe({
      next: () => {
        this.adminService.getUserRoles(user.id).subscribe({
          next: (updatedRoles) => {
            this.selectedUserRoles.set(updatedRoles);
            this.loadUsers();
            this.isLoading.set(false);
          },
        });
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to update role assignment');
        this.isLoading.set(false);
      },
    });
  }

  // --- Role CRUD Actions ---
  submitCreateRole(): void {
    if (this.createRoleForm.invalid) {
      this.createRoleForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const formVal = this.createRoleForm.value;
    this.adminService
      .createRole({
        name: formVal.name,
        code: formVal.code.toUpperCase().trim(),
        description: formVal.description,
      })
      .subscribe({
        next: () => {
          this.feedbackMessage.set('Role created successfully');
          this.showCreateRoleModal.set(false);
          this.loadRoles();
        },
        error: (err) => {
          this.errorMessage.set(err?.error?.message || 'Failed to create role');
          this.isLoading.set(false);
        },
      });
  }

  handleCreateRoleSubmit(payload: { name: string; code?: string; description?: string }): void {
    this.createRoleForm.patchValue({
      name: payload.name,
      code: payload.code,
      description: payload.description,
    });
    this.submitCreateRole();
  }

  openEditRole(role: AdminRole): void {
    this.selectedRole.set(role);
    this.editRoleForm.patchValue({
      name: role.name,
      description: role.description || '',
    });
    this.showEditRoleModal.set(true);
  }

  submitEditRole(): void {
    const role = this.selectedRole();
    if (!role || this.editRoleForm.invalid) {
      this.editRoleForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.adminService
      .updateRole(role.id, {
        name: this.editRoleForm.value.name,
        description: this.editRoleForm.value.description,
      })
      .subscribe({
        next: () => {
          this.feedbackMessage.set('Role updated successfully');
          this.showEditRoleModal.set(false);
          this.loadRoles();
        },
        error: (err) => {
          this.errorMessage.set(err?.error?.message || 'Failed to update role');
          this.isLoading.set(false);
        },
      });
  }

  handleEditRoleSubmit(payload: { name: string; description?: string }): void {
    this.editRoleForm.patchValue(payload);
    this.submitEditRole();
  }

  openManageRolePermissions(role: AdminRole): void {
    this.selectedRole.set(role);
    this.rolePermissionSearch.set('');
    this.isLoading.set(true);
    this.adminService.getRolePermissions(role.id).subscribe({
      next: (perms) => {
        this.selectedRolePermissions.set(perms);
        this.showRolePermissionsModal.set(true);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to load role permissions');
        this.isLoading.set(false);
      },
    });
  }

  isPermissionGrantedToRole(permissionId: string): boolean {
    return this.selectedRolePermissions().some((p) => p.id === permissionId);
  }

  togglePermissionGrant(permissionId: string): void {
    const role = this.selectedRole();
    if (!role) return;

    const isGranted = this.isPermissionGrantedToRole(permissionId);
    this.isLoading.set(true);

    const action$ = isGranted
      ? this.adminService.revokePermissionFromRole(role.id, permissionId)
      : this.adminService.grantPermissionToRole(role.id, permissionId);

    action$.subscribe({
      next: () => {
        this.adminService.getRolePermissions(role.id).subscribe({
          next: (updatedPerms) => {
            this.selectedRolePermissions.set(updatedPerms);
            this.isLoading.set(false);
          },
        });
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to update permission');
        this.isLoading.set(false);
      },
    });
  }

  // --- Permission CRUD Actions ---
  submitCreatePermission(): void {
    if (this.createPermissionForm.invalid) {
      this.createPermissionForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const formVal = this.createPermissionForm.value;
    this.adminService
      .createPermission({
        name: formVal.name,
        code: formVal.code.toUpperCase().trim(),
        resource: formVal.resource.toUpperCase().trim(),
        action: formVal.action.toUpperCase().trim(),
        description: formVal.description,
      })
      .subscribe({
        next: () => {
          this.feedbackMessage.set('Permission created successfully');
          this.showCreatePermissionModal.set(false);
          this.loadPermissions();
        },
        error: (err) => {
          this.errorMessage.set(err?.error?.message || 'Failed to create permission');
          this.isLoading.set(false);
        },
      });
  }

  // --- Organisation CRUD Actions ---
  submitCreateOrg(): void {
    if (this.createOrgForm.invalid) {
      this.createOrgForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const formVal = this.createOrgForm.value;
    this.adminService
      .createOrganization({
        name: formVal.name,
        slug: formVal.slug.toLowerCase().trim(),
      })
      .subscribe({
        next: () => {
          this.feedbackMessage.set('Organisation created successfully');
          this.showCreateOrgModal.set(false);
          this.loadOrganizations();
        },
        error: (err) => {
          this.errorMessage.set(err?.error?.message || 'Failed to create organisation');
          this.isLoading.set(false);
        },
      });
  }

  handleCreateOrgSubmit(payload: { name: string; slug: string }): void {
    this.createOrgForm.patchValue(payload);
    this.submitCreateOrg();
  }

  openEditOrg(org: AdminOrganization): void {
    this.selectedOrg.set(org);
    this.editOrgForm.patchValue({
      name: org.name,
      slug: org.slug,
    });
    this.showEditOrgModal.set(true);
  }

  submitEditOrg(): void {
    const org = this.selectedOrg();
    if (!org || this.editOrgForm.invalid) {
      this.editOrgForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.adminService
      .updateOrganization(org.id, {
        name: this.editOrgForm.value.name,
        slug: this.editOrgForm.value.slug.toLowerCase().trim(),
      })
      .subscribe({
        next: () => {
          this.feedbackMessage.set('Organisation updated successfully');
          this.showEditOrgModal.set(false);
          this.loadOrganizations();
        },
        error: (err) => {
          this.errorMessage.set(err?.error?.message || 'Failed to update organisation');
          this.isLoading.set(false);
        },
      });
  }

  handleEditOrgSubmit(payload: { name: string; slug: string }): void {
    this.editOrgForm.patchValue(payload);
    this.submitEditOrg();
  }

  // --- Deletion Flow ---
  confirmDelete(
    type: 'user' | 'role' | 'permission' | 'organization',
    id: string,
    name: string,
  ): void {
    this.deleteTarget.set({ type, id, name });
    this.showDeleteModal.set(true);
  }

  executeDelete(): void {
    const target = this.deleteTarget();
    if (!target) return;

    this.isLoading.set(true);
    let action$;

    switch (target.type) {
      case 'user':
        action$ = this.adminService.deleteUser(target.id);
        break;
      case 'role':
        action$ = this.adminService.deleteRole(target.id);
        break;
      case 'organization':
        action$ = this.adminService.deleteOrganization(target.id);
        break;
      default:
        this.isLoading.set(false);
        return;
    }

    action$.subscribe({
      next: () => {
        this.feedbackMessage.set(`${target.name} deleted successfully`);
        this.showDeleteModal.set(false);
        this.deleteTarget.set(null);
        this.refreshCurrentSlice();
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || `Failed to delete ${target.name}`);
        this.isLoading.set(false);
      },
    });
  }

  onDismissAlert(type: 'feedback' | 'error'): void {
    if (type === 'feedback') {
      this.feedbackMessage.set(null);
    } else {
      this.errorMessage.set(null);
    }
  }
}
