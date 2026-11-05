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
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { AdminService } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';
import {
  AdminOrganization,
  AdminPermission,
  AdminRole,
  AdminUser,
  UserStatus,
} from '../../core/models/admin.models';

export type AdminSlice = 'users' | 'roles' | 'permissions' | 'organizations';

interface DeleteTarget {
  type: 'user' | 'role' | 'permission' | 'organization';
  id: string;
  name: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
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

  // Table Columns
  readonly userColumns = [
    'name',
    'email',
    'organization',
    'roles',
    'status',
    'createdAt',
    'actions',
  ];
  readonly roleColumns = [
    'name',
    'code',
    'description',
    'type',
    'createdAt',
    'actions',
  ];
  readonly permissionColumns = [
    'name',
    'code',
    'resource',
    'action',
    'description',
  ];
  readonly organizationColumns = [
    'name',
    'slug',
    'ownerId',
    'createdAt',
    'actions',
  ];

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

  readonly showCreateRoleModal = signal<boolean>(false);
  readonly showEditRoleModal = signal<boolean>(false);
  readonly showRolePermissionsModal = signal<boolean>(false);

  readonly showCreatePermissionModal = signal<boolean>(false);

  readonly showCreateOrgModal = signal<boolean>(false);
  readonly showEditOrgModal = signal<boolean>(false);
  readonly selectedOrg = signal<AdminOrganization | null>(null);

  readonly showDeleteModal = signal<boolean>(false);
  readonly deleteTarget = signal<DeleteTarget | null>(null);

  // Forms
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

  // UI styling classes
  readonly activeSliceClass =
    'px-3 py-1.5 text-xs font-bold rounded-lg bg-surface text-bhagwa shadow-xs border border-app transition-all flex items-center gap-1.5 cursor-pointer';
  readonly inactiveSliceClass =
    'px-3 py-1.5 text-xs font-medium rounded-lg text-secondary hover:text-main hover:bg-surface/60 transition-all flex items-center gap-1.5 cursor-pointer';

  readonly searchPlaceholder = computed(() => {
    switch (this.activeSlice()) {
      case 'users':
        return 'Filter users by name or email...';
      case 'roles':
        return 'Filter roles by name or code...';
      case 'permissions':
        return 'Filter permissions by code or resource...';
      case 'organizations':
        return 'Filter organisations by name or slug...';
    }
  });

  readonly createButtonLabel = computed(() => {
    switch (this.activeSlice()) {
      case 'users':
        return 'Add User';
      case 'roles':
        return 'Add Role';
      case 'organizations':
        return 'Add Organisation';
      default:
        return '';
    }
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
    this.showCreateRoleModal.set(false);
    this.showEditRoleModal.set(false);
    this.showRolePermissionsModal.set(false);
    this.showCreatePermissionModal.set(false);
    this.showCreateOrgModal.set(false);
    this.showEditOrgModal.set(false);
    this.showDeleteModal.set(false);
    this.feedbackMessage.set(null);
    this.errorMessage.set(null);
  }

  private setupFilterPredicates(): void {
    // Users Filter Predicate
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
            user.organizationName?.toLowerCase().includes(query),
        );

      return Boolean(matchesStatus && matchesQuery);
    };

    // Roles Filter Predicate
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

    // Permissions Filter Predicate
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

    // Organisations Filter Predicate
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
    this.attachTableControls();
  }

  private attachTableControls(): void {
    setTimeout(() => {
      switch (this.activeSlice()) {
        case 'users':
          this.usersDataSource.paginator = this.usersPaginator;
          this.usersDataSource.sort = this.usersSort;
          break;
        case 'roles':
          this.rolesDataSource.paginator = this.rolesPaginator;
          this.rolesDataSource.sort = this.rolesSort;
          break;
        case 'permissions':
          this.permissionsDataSource.paginator = this.permissionsPaginator;
          this.permissionsDataSource.sort = this.permissionsSort;
          break;
        case 'organizations':
          this.organizationsDataSource.paginator = this.orgsPaginator;
          this.organizationsDataSource.sort = this.orgsSort;
          break;
      }
    });
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
        this.attachTableControls();
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to load users');
        this.isLoading.set(false);
      },
    });
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchFilter.set(value);
    this.applyAllFilters();
  }

  onUserStatusFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.userStatusFilter.set(value);
    this.applyUsersFilter();
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
        this.attachTableControls();
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to load roles');
        this.isLoading.set(false);
      },
    });
  }

  onRoleTypeFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.roleTypeFilter.set(value);
    this.applyRolesFilter();
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
        this.attachTableControls();
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to load permissions');
        this.isLoading.set(false);
      },
    });
  }

  onPermissionResourceFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.permissionResourceFilter.set(value);
    this.applyPermissionsFilter();
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
        this.attachTableControls();
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

  private applyAllFilters(): void {
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
        this.createUserForm.reset({ roleId: '' });
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
    this.adminService
      .createUser({
        name: formVal.name,
        email: formVal.email,
        password: formVal.password,
        mobileNumber: formVal.mobileNumber || undefined,
        organizationId: formVal.organizationId || undefined,
        roleId: formVal.roleId || undefined,
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

  openEditUser(user: AdminUser): void {
    this.selectedUser.set(user);
    this.editUserForm.patchValue({
      name: user.name,
      email: user.email,
      mobileNumber: user.mobileNumber || '',
      organizationId: user.organizationId || '',
    });
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
    const orgId = formVal.organizationId ? formVal.organizationId : undefined;
    const clearOrg = !formVal.organizationId && !!user.organizationId;

    this.adminService
      .updateUser(user.id, {
        name: formVal.name,
        email: formVal.email,
        mobileNumber: formVal.mobileNumber || undefined,
        organizationId: orgId,
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

  openResetPasswordModal(user: AdminUser): void {
    this.selectedUser.set(user);
    this.resetPasswordForm.reset();
    this.showPasswordText.set(false);
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

  openManageRolePermissions(role: AdminRole): void {
    this.selectedRole.set(role);
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
}
