import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { AdminComponent } from './admin';
import { AdminService } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';
import {
  AdminOrganization,
  AdminPermission,
  AdminRole,
  AdminUser,
} from '../../core/models/admin.models';

describe('AdminComponent', () => {
  let adminService: AdminService;
  let authService: AuthService;
  let router: Router;

  const mockUsers: AdminUser[] = [
    {
      id: 'u-1',
      name: 'Alpha Admin',
      email: 'admin@aura.io',
      status: 'ACTIVE',
      roles: ['ADMIN'],
      organizationId: 'c8ab3bb0-ab1e-475e-ad03-a4e5aa2cd4f5',
      organizationName: 'comp',
      organizationSlug: 'comp',
      organizations: [
        {
          id: 'f1f0b619-1ded-422d-a2fa-4112d5c799dc',
          name: 'Acme Software Corp',
          slug: 'acme-corp',
        },
        {
          id: '60820aef-23f2-4d23-9ba4-96627b19fb90',
          name: 'Company',
          slug: 'company',
        },
        {
          id: 'c8ab3bb0-ab1e-475e-ad03-a4e5aa2cd4f5',
          name: 'comp',
          slug: 'comp',
        },
      ],
    },
    {
      id: 'u-2',
      name: 'Beta Developer',
      email: 'beta@aura.io',
      status: 'SUSPENDED',
      roles: ['MEMBER'],
      organizationName: 'ApiAura Org',
    },
  ];

  const mockRoles: AdminRole[] = [
    {
      id: 'r-1',
      name: 'Administrator',
      code: 'ADMIN',
      description: 'Full administrative rights',
      systemRole: true,
    },
    {
      id: 'r-2',
      name: 'Custom Reviewer',
      code: 'REVIEWER',
      description: 'API Reviewer',
      systemRole: false,
    },
  ];

  const mockPermissions: AdminPermission[] = [
    {
      id: 'p-1',
      name: 'Read Users',
      code: 'USER:READ',
      resource: 'USER',
      action: 'READ',
      description: 'View user accounts',
    },
    {
      id: 'p-2',
      name: 'Create Roles',
      code: 'ROLE:CREATE',
      resource: 'ROLE',
      action: 'CREATE',
      description: 'Create new roles',
    },
  ];

  const mockOrgs: AdminOrganization[] = [
    {
      id: 'o-1',
      name: 'ApiAura Org',
      slug: 'apiaura-org',
      ownerId: 'u-1',
    },
  ];

  beforeEach(async () => {
    const adminServiceSpy = {
      getUsers: () => of(mockUsers),
      getRoles: () => of(mockRoles),
      getPermissions: () => of(mockPermissions),
      getOrganizations: () => of(mockOrgs),
      createUser: () => of(mockUsers[0]),
      updateUser: () => of(mockUsers[0]),
      updateUserStatus: () => of(mockUsers[0]),
      deleteUser: () => of(void 0),
      getUserRoles: () => of(mockRoles),
      assignRoleToUser: () => of(void 0),
      removeRoleFromUser: () => of(void 0),
      setUserRoles: () => of(void 0),
      resetUserPassword: () => of(void 0),
      createRole: () => of(mockRoles[0]),
      updateRole: () => of(mockRoles[0]),
      deleteRole: () => of(void 0),
      getRolePermissions: () => of(mockPermissions),
      grantPermissionToRole: () => of(void 0),
      revokePermissionFromRole: () => of(void 0),
      createPermission: () => of(mockPermissions[0]),
      deletePermission: () => of(void 0),
      createOrganization: () => of(mockOrgs[0]),
      updateOrganization: () => of(mockOrgs[0]),
      deleteOrganization: () => of(void 0),
      getOrganizationInvitations: () => of([]),
      createOrganizationInvitation: () =>
        of({
          id: 'inv-1',
          email: 'colleague@aura.io',
          roleCode: 'MEMBER',
          status: 'PENDING',
          organizationId: 'o-1',
          createdAt: new Date().toISOString(),
          expiresAt: new Date().toISOString(),
        }),
      cancelOrganizationInvitation: () => of(void 0),
    };

    await TestBed.configureTestingModule({
      imports: [AdminComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AdminService, useValue: adminServiceSpy },
      ],
    }).compileComponents();

    adminService = TestBed.inject(AdminService);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);

    authService.currentUser.set({
      id: 'admin-1',
      name: 'Admin Boss',
      email: 'admin@aura.io',
      roles: ['ADMIN'],
    });
  });

  it('should create AdminComponent', () => {
    const fixture = TestBed.createComponent(AdminComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should fetch backend data on initialization and populate MatTable data sources', () => {
    const fixture = TestBed.createComponent(AdminComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    expect(comp.users().length).toBe(2);
    expect(comp.roles().length).toBe(2);
    expect(comp.permissions().length).toBe(2);
    expect(comp.organizations().length).toBe(1);

    expect(comp.usersDataSource.data.length).toBe(2);
    expect(comp.rolesDataSource.data.length).toBe(2);
    expect(comp.permissionsDataSource.data.length).toBe(2);
    expect(comp.organizationsDataSource.data.length).toBe(1);
  });

  it('should switch slices when slice tab buttons are clicked', () => {
    const fixture = TestBed.createComponent(AdminComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    expect(comp.activeSlice()).toBe('users');

    comp.setSlice('roles');
    expect(comp.activeSlice()).toBe('roles');

    comp.setSlice('permissions');
    expect(comp.activeSlice()).toBe('permissions');

    comp.setSlice('organizations');
    expect(comp.activeSlice()).toBe('organizations');
  });

  it('should filter users by search input and status dropdown', () => {
    const fixture = TestBed.createComponent(AdminComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;

    // Search query filter
    comp.searchFilter.set('Beta');
    comp['applyUsersFilter']();
    expect(comp.usersDataSource.filteredData.length).toBe(1);
    expect(comp.usersDataSource.filteredData[0].name).toBe('Beta Developer');

    // Status filter
    comp.searchFilter.set('');
    comp.userStatusFilter.set('ACTIVE');
    comp['applyUsersFilter']();
    expect(comp.usersDataSource.filteredData.length).toBe(1);
    expect(comp.usersDataSource.filteredData[0].status).toBe('ACTIVE');
  });

  it('should open create modal depending on active slice', () => {
    const fixture = TestBed.createComponent(AdminComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;

    comp.setSlice('users');
    comp.openCreateModal();
    expect(comp.showCreateUserModal()).toBe(true);

    comp.showCreateUserModal.set(false);
    comp.setSlice('roles');
    comp.openCreateModal();
    expect(comp.showCreateRoleModal()).toBe(true);
  });

  it('should handle deletion confirmation flow', () => {
    const fixture = TestBed.createComponent(AdminComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    comp.confirmDelete('user', 'u-1', 'Alpha Admin');

    expect(comp.showDeleteModal()).toBe(true);
    expect(comp.deleteTarget()?.name).toBe('Alpha Admin');

    comp.executeDelete();
    expect(comp.showDeleteModal()).toBe(false);
    expect(comp.feedbackMessage()).toContain('deleted successfully');
  });

  it('should not show admin related details and should clear data when user logs out', () => {
    const fixture = TestBed.createComponent(AdminComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    expect(comp.usersDataSource.data.length).toBe(2);

    const navigateSpy = vi.spyOn(router, 'navigate');

    // Simulate user logout
    authService.currentUser.set(null);
    fixture.detectChanges();

    // Template should hide all admin details
    const sliceUsersButton = fixture.nativeElement.querySelector('#tab-slice-users');
    expect(sliceUsersButton).toBeNull();
    const searchInput = fixture.nativeElement.querySelector('#admin-search-input');
    expect(searchInput).toBeNull();

    // Data sources should be cleared
    expect(comp.usersDataSource.data.length).toBe(0);
    expect(comp.rolesDataSource.data.length).toBe(0);
    expect(comp.permissionsDataSource.data.length).toBe(0);
    expect(comp.organizationsDataSource.data.length).toBe(0);

    // Should redirect to home
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });

  it('should open edit user modal and populate email, phone, name, and organisation', () => {
    const fixture = TestBed.createComponent(AdminComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    comp.openEditUser({
      id: 'u-1',
      name: 'Alpha Admin',
      email: 'admin@aura.io',
      mobileNumber: '+91 9999999999',
      organizationId: 'o-1',
      status: 'ACTIVE',
    });

    expect(comp.showEditUserModal()).toBe(true);
    expect(comp.editUserForm.value.name).toBe('Alpha Admin');
    expect(comp.editUserForm.value.email).toBe('admin@aura.io');
    expect(comp.editUserForm.value.mobileNumber).toBe('+91 9999999999');
    expect(comp.editUserSelectedOrgIds()).toEqual(['o-1']);
  });

  it('should submit updated user with edited email, phone, name, and organisation', () => {
    const fixture = TestBed.createComponent(AdminComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    comp.openEditUser({
      id: 'u-1',
      name: 'Alpha Admin',
      email: 'admin@aura.io',
      status: 'ACTIVE',
      organizationId: 'o-1',
    });

    const updateSpy = vi.spyOn(adminService, 'updateUser');

    comp.editUserForm.patchValue({
      name: 'Updated Alpha',
      email: 'updated-alpha@aura.io',
      mobileNumber: '+91 8888888888',
    });
    comp.editUserSelectedOrgIds.set(['o-1']);

    comp.submitEditUser();

    expect(updateSpy).toHaveBeenCalledWith('u-1', {
      name: 'Updated Alpha',
      email: 'updated-alpha@aura.io',
      mobileNumber: '+91 8888888888',
      organizationId: 'o-1',
      organizationIds: ['o-1'],
      clearOrganization: false,
    });
    expect(comp.showEditUserModal()).toBe(false);
    expect(comp.feedbackMessage()).toBe('User updated successfully');
  });

  it('should open reset password modal and submit new password for particular user', () => {
    const fixture = TestBed.createComponent(AdminComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    const targetUser = mockUsers[0];

    comp.openResetPasswordModal(targetUser);
    expect(comp.showResetPasswordModal()).toBe(true);
    expect(comp.selectedUser()?.id).toBe('u-1');

    const resetSpy = vi.spyOn(adminService, 'resetUserPassword');
    comp.resetPasswordForm.patchValue({
      newPassword: 'newSecretPassword123',
    });

    comp.submitResetPassword();

    expect(resetSpy).toHaveBeenCalledWith('u-1', 'newSecretPassword123');
    expect(comp.showResetPasswordModal()).toBe(false);
    expect(comp.feedbackMessage()).toContain('Password for Alpha Admin created successfully');
  });

  it('should open details panel with user details when clicking view eye button on user row', () => {
    const fixture = TestBed.createComponent(AdminComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    const targetUser = mockUsers[0];

    comp.openDetailsPanel('user', targetUser);
    fixture.detectChanges();

    expect(comp.showDetailsPanel()).toBe(true);
    expect(comp.detailType()).toBe('user');
    expect(comp.userDetail?.name).toBe('Alpha Admin');
    expect(comp.userDetail?.email).toBe('admin@aura.io');

    const detailsPanel = fixture.nativeElement.querySelector('#details-panel');
    expect(detailsPanel).toBeTruthy();
    expect(detailsPanel.textContent).toContain('USER Details');
    expect(detailsPanel.textContent).toContain('Alpha Admin');
    expect(detailsPanel.textContent).toContain('admin@aura.io');
    expect(detailsPanel.textContent).toContain('u-1');
  });

  it('should open details panel with role details and fetch granted permissions when viewing role', () => {
    const fixture = TestBed.createComponent(AdminComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    const targetRole = mockRoles[0];
    const getRolePermsSpy = vi.spyOn(adminService, 'getRolePermissions');

    comp.openDetailsPanel('role', targetRole);
    fixture.detectChanges();

    expect(comp.showDetailsPanel()).toBe(true);
    expect(comp.detailType()).toBe('role');
    expect(comp.roleDetail?.code).toBe('ADMIN');
    expect(getRolePermsSpy).toHaveBeenCalledWith('r-1');
    expect(comp.roleDetailPermissions().length).toBe(2);

    const detailsPanel = fixture.nativeElement.querySelector('#details-panel');
    expect(detailsPanel).toBeTruthy();
    expect(detailsPanel.textContent).toContain('ROLE Details');
    expect(detailsPanel.textContent).toContain('Full administrative rights');
    expect(detailsPanel.textContent).toContain('USER:READ');
  });

  it('should open details panel with permission details when viewing permission', () => {
    const fixture = TestBed.createComponent(AdminComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    const targetPerm = mockPermissions[0];

    comp.openDetailsPanel('permission', targetPerm);
    fixture.detectChanges();

    expect(comp.showDetailsPanel()).toBe(true);
    expect(comp.detailType()).toBe('permission');
    expect(comp.permissionDetail?.name).toBe('Read Users');
    expect(comp.permissionDetail?.code).toBe('USER:READ');

    const detailsPanel = fixture.nativeElement.querySelector('#details-panel');
    expect(detailsPanel).toBeTruthy();
    expect(detailsPanel.textContent).toContain('PERMISSION Details');
    expect(detailsPanel.textContent).toContain('View user accounts');
  });

  it('should open details panel with organisation details when viewing organisation', () => {
    const fixture = TestBed.createComponent(AdminComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    const targetOrg = mockOrgs[0];

    comp.openDetailsPanel('organization', targetOrg);
    fixture.detectChanges();

    expect(comp.showDetailsPanel()).toBe(true);
    expect(comp.detailType()).toBe('organization');
    expect(comp.orgDetail?.name).toBe('ApiAura Org');
    expect(comp.orgDetail?.slug).toBe('apiaura-org');

    const detailsPanel = fixture.nativeElement.querySelector('#details-panel');
    expect(detailsPanel).toBeTruthy();
    expect(detailsPanel.textContent).toContain('ORGANIZATION Details');
    expect(detailsPanel.textContent).toContain('apiaura-org');
    expect(detailsPanel.textContent).toContain('Organisation Administrator');
    expect(detailsPanel.textContent).toContain('Alpha Admin');
  });

  it('should close details panel when close button or backdrop is clicked', () => {
    const fixture = TestBed.createComponent(AdminComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    comp.openDetailsPanel('user', mockUsers[0]);
    fixture.detectChanges();

    expect(comp.showDetailsPanel()).toBe(true);

    const closeBtn = fixture.nativeElement.querySelector('#btn-close-details-panel');
    closeBtn.click();
    fixture.detectChanges();

    expect(comp.showDetailsPanel()).toBe(false);
    expect(comp.selectedDetailItem()).toBeNull();
  });

  it('should organize permissions into groups by resource category', () => {
    const fixture = TestBed.createComponent(AdminComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    comp.openManageRolePermissions(mockRoles[0]);
    fixture.detectChanges();

    const groups = comp.permissionGroups();
    expect(groups.length).toBeGreaterThan(0);
    const userGroup = groups.find((g) => g.resource === 'user');
    expect(userGroup).toBeTruthy();
    expect(userGroup?.displayName).toBe('User Management');
    expect(userGroup?.permissions.some((p) => p.code === 'USER:READ')).toBe(true);
  });

  it('should filter permission groups based on rolePermissionSearch query', () => {
    const fixture = TestBed.createComponent(AdminComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    comp.openManageRolePermissions(mockRoles[0]);
    fixture.detectChanges();

    comp.rolePermissionSearch.set('USER:READ');
    fixture.detectChanges();

    const filtered = comp.permissionGroups();
    expect(filtered.length).toBe(1);
    expect(filtered[0].resource).toBe('user');

    comp.rolePermissionSearch.set('nonexistent_query_xyz');
    fixture.detectChanges();
    expect(comp.permissionGroups().length).toBe(0);
  });

  it('should batch grant and revoke permissions via toggleGroupPermissions', () => {
    const fixture = TestBed.createComponent(AdminComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    comp.openManageRolePermissions(mockRoles[0]);
    // Initially role only has p-1 (user:read)
    comp.selectedRolePermissions.set([mockPermissions[0]]);
    fixture.detectChanges();

    const grantSpy = vi.spyOn(adminService, 'grantPermissionToRole');
    const revokeSpy = vi.spyOn(adminService, 'revokePermissionFromRole');

    // In mock, p-2 is in 'role' group and not granted -> grant should call p-2
    const roleGroup = comp.permissionGroups().find((g) => g.resource === 'role')!;
    comp.toggleGroupPermissions(roleGroup, true);
    expect(grantSpy).toHaveBeenCalledWith('r-1', 'p-2');

    // In mock, p-1 is in 'user' group and granted -> revoke should call p-1
    const userGroup = comp.permissionGroups().find((g) => g.resource === 'user')!;
    comp.toggleGroupPermissions(userGroup, false);
    expect(revokeSpy).toHaveBeenCalledWith('r-1', 'p-1');
  });

  it('should allow searching candidate users and assigning user and role to an organisation', () => {
    const fixture = TestBed.createComponent(AdminComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    comp.openDetailsPage('organization', mockOrgs[0]);
    fixture.detectChanges();

    // Set up users with explicit organizationId
    comp.users.set([
      {
        id: 'u-1',
        name: 'Member User',
        email: 'member@aura.io',
        organizationId: 'o-1',
        status: 'ACTIVE',
        roles: ['ADMIN'],
      },
      {
        id: 'u-2',
        name: 'Candidate User',
        email: 'candidate@aura.io',
        mobileNumber: '+91 9123456789',
        organizationId: undefined,
        status: 'ACTIVE',
        roles: [],
      },
      {
        id: 'u-3',
        name: 'Other Org User',
        email: 'other@aura.io',
        organizationId: 'o-2',
        status: 'ACTIVE',
        roles: [],
      },
    ]);
    fixture.detectChanges();

    // Verify currentOrgMembers has u-1
    expect(comp.currentOrgMembers().map((u) => u.id)).toEqual(['u-1']);

    // Candidate users should include u-2 and u-3
    expect(comp.candidateUsersForOrg().map((u) => u.id)).toEqual(['u-2', 'u-3']);

    // Search candidate by mobile number
    comp.assignUserSearch.set('912345');
    expect(comp.candidateUsersForOrg().length).toBe(1);
    expect(comp.candidateUsersForOrg()[0].id).toBe('u-2');

    // Select candidate u-2
    comp.selectAssignUser(comp.candidateUsersForOrg()[0]);
    expect(comp.selectedAssignUser()?.id).toBe('u-2');
    expect(comp.assignUserDropdownOpen()).toBe(false);

    // Select role r-1
    comp.selectedAssignRoleId.set('r-1');

    const updateSpy = vi.spyOn(adminService, 'updateUser');
    const setRolesSpy = vi.spyOn(adminService, 'setUserRoles');

    comp.assignUserToCurrentOrg();

    expect(updateSpy).toHaveBeenCalledWith('u-2', {
      organizationId: 'o-1',
      roleIds: ['r-1'],
    });
    expect(comp.selectedAssignUser()).toBeNull();
    expect(comp.selectedAssignRoleId()).toBe('');
    expect(comp.feedbackMessage()).toContain('Successfully assigned Candidate User to ApiAura Org');
  });

  it('should allow changing member role and removing member from organisation', () => {
    const fixture = TestBed.createComponent(AdminComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    comp.openDetailsPage('organization', mockOrgs[0]);
    fixture.detectChanges();

    const member: AdminUser = {
      id: 'u-1',
      name: 'Alpha Member',
      email: 'member@aura.io',
      organizationId: 'o-1',
      status: 'ACTIVE',
      roles: ['ADMIN'],
    };

    const setRolesSpy = vi.spyOn(adminService, 'setUserRoles');
    comp.changeMemberRole(member, 'r-2');
    expect(setRolesSpy).toHaveBeenCalledWith('u-1', ['r-2']);
    expect(comp.feedbackMessage()).toContain('Updated role for Alpha Member');

    const updateSpy = vi.spyOn(adminService, 'updateUser');
    comp.removeUserFromOrg(member);
    expect(updateSpy).toHaveBeenCalledWith('u-1', { clearOrganization: true });
    expect(comp.feedbackMessage()).toContain('Removed Alpha Member from ApiAura Org');
  });

  it('should support searching and selecting multiple organisations in Edit User modal without roles', () => {
    const fixture = TestBed.createComponent(AdminComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;

    const extraOrg: AdminOrganization = {
      id: 'o-2',
      name: 'Beta Global Org',
      slug: 'beta-global',
    };
    comp.organizations.set([...mockOrgs, extraOrg]);

    // Super Admin perspective
    authService.currentUser.set({
      id: 'super-1',
      name: 'Super User',
      email: 'super@aura.io',
      roles: ['SUPER_ADMIN'],
    });

    comp.openEditUser({
      id: 'u-target',
      name: 'Target User',
      email: 'target@aura.io',
      status: 'ACTIVE',
      organizationId: 'o-1',
      organizations: [{ id: 'o-1', name: 'ApiAura Org', slug: 'apiaura-org' }],
    });

    expect(comp.isEditUserOrgSelected('o-1')).toBe(true);
    expect(comp.isEditUserOrgSelected('o-2')).toBe(false);

    // Search organisations in edit user
    comp.editUserOrgSearch.set('Beta');
    expect(comp.editUserAvailableOrgs().length).toBe(1);
    expect(comp.editUserAvailableOrgs()[0].id).toBe('o-2');

    // Toggle o-2 to add it (multi-org)
    comp.toggleEditUserOrg('o-2');
    expect(comp.isEditUserOrgSelected('o-2')).toBe(true);
    expect(comp.editUserSelectedOrgIds()).toEqual(['o-1', 'o-2']);

    // Remove o-1
    comp.removeEditUserOrg('o-1');
    expect(comp.isEditUserOrgSelected('o-1')).toBe(false);
    expect(comp.editUserSelectedOrgIds()).toEqual(['o-2']);

    const updateSpy = vi.spyOn(adminService, 'updateUser');
    comp.submitEditUser();

    // Verify updateUser does NOT send roleIds and sends organizationIds
    expect(updateSpy).toHaveBeenCalledWith('u-target', {
      name: 'Target User',
      email: 'target@aura.io',
      mobileNumber: undefined,
      organizationId: 'o-2',
      organizationIds: ['o-2'],
      clearOrganization: false,
    });
  });

  it('should allow assigning multiple organisations and roles in Add User modal for admin and super admin', () => {
    const fixture = TestBed.createComponent(AdminComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;

    const extraOrg: AdminOrganization = {
      id: 'o-2',
      name: 'Secondary Org',
      slug: 'secondary-org',
    };
    comp.organizations.set([...mockOrgs, extraOrg]);

    // Super Admin perspective
    authService.currentUser.set({
      id: 'super-1',
      name: 'Super User',
      email: 'super@aura.io',
      roles: ['SUPER_ADMIN'],
    });

    comp.openCreateModal();
    expect(comp.showCreateUserModal()).toBe(true);

    // Fill basic user form
    comp.createUserForm.patchValue({
      name: 'New Multi User',
      email: 'newuser@aura.io',
      password: 'password123',
    });

    // Multi-select organisations
    comp.toggleCreateUserOrg('o-1');
    comp.toggleCreateUserOrg('o-2');
    expect(comp.createUserSelectedOrgIds()).toEqual(['o-1', 'o-2']);

    // Multi-select roles
    comp.toggleCreateUserRole('r-1');
    comp.toggleCreateUserRole('r-2');
    expect(comp.createUserSelectedRoleIds()).toEqual(['r-1', 'r-2']);

    const createSpy = vi.spyOn(adminService, 'createUser');
    comp.submitCreateUser();

    expect(createSpy).toHaveBeenCalledWith({
      name: 'New Multi User',
      email: 'newuser@aura.io',
      password: 'password123',
      mobileNumber: undefined,
      organizationId: 'o-1',
      organizationIds: ['o-1', 'o-2'],
      roleId: 'r-1',
      roleIds: ['r-1', 'r-2'],
    });
    expect(comp.showCreateUserModal()).toBe(false);
    expect(comp.feedbackMessage()).toBe('User created successfully');
  });

  it('should render organizations from user organizations array in table and in details pane', () => {
    const fixture = TestBed.createComponent(AdminComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    const multiOrgUser = mockUsers[0];

    // Helper returns organizations array
    const orgs = comp.getUserOrganizations(multiOrgUser);
    expect(orgs.length).toBe(3);
    expect(orgs.map((o) => o.name)).toEqual(['Acme Software Corp', 'Company', 'comp']);

    // Check table rendering contains organizations
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Acme Software Corp');

    // Open details pane
    comp.openDetailsPanel('user', multiOrgUser);
    fixture.detectChanges();

    expect(comp.showDetailsPage()).toBe(true);
    expect(comp.userDetail).toEqual(multiOrgUser);
    expect(compiled.textContent).toContain('Organisation Membership (3)');
    expect(compiled.textContent).toContain('Acme Software Corp');
    expect(compiled.textContent).toContain('Company');
    expect(compiled.textContent).toContain('comp');
  });

  it('should load invitations when opening organization details and handle sending & cancelling invitations', () => {
    const fixture = TestBed.createComponent(AdminComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    const org = mockOrgs[0];

    const getInvitesSpy = vi.spyOn(adminService, 'getOrganizationInvitations').mockReturnValue(
      of([
        {
          id: 'inv-existing',
          email: 'existing@aura.io',
          status: 'PENDING',
          organizationId: org.id,
          createdAt: new Date().toISOString(),
          expiresAt: new Date().toISOString(),
        },
      ]),
    );

    comp.openDetailsPage('organization', org);
    expect(getInvitesSpy).toHaveBeenCalledWith(org.id);
    expect(comp.orgInvitations().length).toBe(1);
    expect(comp.orgInvitations()[0].email).toBe('existing@aura.io');

    const createInviteSpy = vi.spyOn(adminService, 'createOrganizationInvitation');
    comp.handleSendOrgInvitation({ email: 'newcolleague@aura.io', roleCode: 'MEMBER' });
    expect(createInviteSpy).toHaveBeenCalledWith(org.id, {
      email: 'newcolleague@aura.io',
      roleCode: 'MEMBER',
    });
    expect(comp.orgInvitations().length).toBe(2);
    expect(comp.feedbackMessage()).toBe('Invitation sent to newcolleague@aura.io');

    const cancelInviteSpy = vi.spyOn(adminService, 'cancelOrganizationInvitation');
    comp.handleCancelOrgInvitation('inv-existing');
    expect(cancelInviteSpy).toHaveBeenCalledWith(org.id, 'inv-existing');
    expect(comp.orgInvitations().some((i) => i.id === 'inv-existing')).toBe(false);
    expect(comp.feedbackMessage()).toBe('Invitation canceled successfully');
  });

  it('should not show the SUPER_ADMIN role or allow super admin actions to other admins', () => {
    const fixture = TestBed.createComponent(AdminComponent);
    fixture.detectChanges();
    const comp = fixture.componentInstance;

    // Set logged-in user as a regular ADMIN (not SUPER_ADMIN)
    authService.currentUser.set({
      id: 'admin-regular',
      name: 'Regular Admin',
      email: 'admin@company.com',
      roles: ['ADMIN'],
      organizationId: 'o-1',
    });

    const superAdminRole: AdminRole = {
      id: 'r-super',
      name: 'Super Admin Role',
      code: 'SUPER_ADMIN',
      systemRole: true,
    };
    const standardRole: AdminRole = {
      id: 'r-member',
      name: 'Member Role',
      code: 'MEMBER',
      systemRole: false,
    };

    // Mock roles response containing SUPER_ADMIN and MEMBER
    vi.spyOn(adminService, 'getRoles').mockReturnValue(of([superAdminRole, standardRole]));
    comp.loadRoles();

    // SUPER_ADMIN role must be filtered out for non-super admins
    expect(comp.roles().some((r) => r.code === 'SUPER_ADMIN')).toBe(false);
    expect(comp.rolesDataSource.data.some((r) => r.code === 'SUPER_ADMIN')).toBe(false);
    expect(comp.assignableRoles().some((r) => r.code === 'SUPER_ADMIN')).toBe(false);

    // Target user is a Super Admin
    const superAdminUser: AdminUser = {
      id: 'u-super',
      name: 'Root Super Admin',
      email: 'root@aura.io',
      status: 'ACTIVE',
      roles: ['SUPER_ADMIN', 'ADMIN'],
    };
    comp.users.set([superAdminUser]);

    // Check helper identifying super admin user
    expect(comp.isSuperAdminUser(superAdminUser)).toBe(true);

    // Editing super admin user must be blocked for other admins
    comp.openEditUser(superAdminUser);
    expect(comp.showEditUserModal()).toBe(false);

    // Resetting password on super admin user must be blocked
    comp.openResetPasswordModal(superAdminUser);
    expect(comp.showResetPasswordModal()).toBe(false);

    // Managing roles on super admin user must be blocked
    comp.openManageUserRoles(superAdminUser);
    expect(comp.showUserRolesModal()).toBe(false);

    // Deleting super admin user must be blocked
    comp.confirmDelete('user', superAdminUser.id, superAdminUser.name);
    expect(comp.showDeleteModal()).toBe(false);

    // Editing or deleting the SUPER_ADMIN role must be blocked
    comp.openEditRole(superAdminRole);
    expect(comp.showEditRoleModal()).toBe(false);
    comp.confirmDelete('role', superAdminRole.id, superAdminRole.name);
    expect(comp.showDeleteModal()).toBe(false);

    // When the logged-in user IS a SUPER_ADMIN, actions and role visibility are unlocked
    authService.currentUser.set({
      id: 'super-user',
      name: 'Super Admin',
      email: 'super@aura.io',
      roles: ['SUPER_ADMIN'],
    });

    comp.loadRoles();
    expect(comp.roles().some((r) => r.code === 'SUPER_ADMIN')).toBe(true);
    expect(comp.rolesDataSource.data.some((r) => r.code === 'SUPER_ADMIN')).toBe(true);

    comp.openEditUser(superAdminUser);
    expect(comp.showEditUserModal()).toBe(true);
  });

  it('should hide wildcard permission (*) from permissions list, unique resources, and role assignment groups', () => {
    const fixture = TestBed.createComponent(AdminComponent);
    fixture.detectChanges();
    const comp = fixture.componentInstance;

    const wildcardPerm: AdminPermission = {
      id: 'p-wildcard',
      name: 'All Permissions',
      code: '*',
      resource: '*',
      action: '*',
      description: 'Root wildcard bypass',
    };
    const regularPerm: AdminPermission = {
      id: 'p-user-read',
      name: 'Read Users',
      code: 'user:read',
      resource: 'user',
      action: 'read',
      description: 'View user accounts',
    };

    // When backend returns permissions including wildcard
    vi.spyOn(adminService, 'getPermissions').mockReturnValue(of([wildcardPerm, regularPerm]));
    comp.loadPermissions();

    // Permissions signal and table datasource must not include wildcard
    expect(comp.permissions().some((p) => p.code === '*')).toBe(false);
    expect(comp.permissionsDataSource.data.some((p) => p.code === '*')).toBe(false);
    expect(comp.permissions().length).toBe(1);
    expect(comp.permissions()[0].code).toBe('user:read');

    // Unique resources must not contain '*'
    expect(comp.uniqueResources()).not.toContain('*');
    expect(comp.uniqueResources()).toContain('user');

    // Role permissions group must not include wildcard
    comp.selectedRole.set(mockRoles[0]);
    comp.selectedRolePermissions.set([]);
    const groups = comp.permissionGroups();
    expect(groups.some((g) => g.resource === '*')).toBe(false);
    expect(groups.flatMap((g) => g.permissions).some((p) => p.code === '*')).toBe(false);

    // Toggling wildcard grant should be blocked
    const grantSpy = vi.spyOn(adminService, 'grantPermissionToRole');
    comp.togglePermissionGrant('p-wildcard');
    expect(grantSpy).not.toHaveBeenCalled();

    // Confirm deleting wildcard permission should be blocked
    comp.confirmDelete('permission', 'p-wildcard', 'All Permissions (*)');
    expect(comp.showDeleteModal()).toBe(false);
  });
});
