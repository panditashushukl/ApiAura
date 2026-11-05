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
      organizationName: 'ApiAura Org',
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
    expect(comp.editUserForm.value.organizationId).toBe('o-1');
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
    });

    const updateSpy = vi.spyOn(adminService, 'updateUser');

    comp.editUserForm.patchValue({
      name: 'Updated Alpha',
      email: 'updated-alpha@aura.io',
      mobileNumber: '+91 8888888888',
      organizationId: 'o-1',
    });

    comp.submitEditUser();

    expect(updateSpy).toHaveBeenCalledWith('u-1', {
      name: 'Updated Alpha',
      email: 'updated-alpha@aura.io',
      mobileNumber: '+91 8888888888',
      organizationId: 'o-1',
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
});
