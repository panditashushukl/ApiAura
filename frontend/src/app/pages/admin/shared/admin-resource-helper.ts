import {
  AdminOrganization,
  AdminPermission,
  AdminRole,
  AdminUser,
} from '../../../core/models/admin.models';

export type AdminSlice = 'users' | 'roles' | 'permissions' | 'organizations';
export type DetailType = 'user' | 'role' | 'permission' | 'organization';

export interface PermissionGroup {
  resource: string;
  displayName: string;
  description: string;
  permissions: AdminPermission[];
  grantedCount: number;
  totalCount: number;
}

export interface DeleteTarget {
  type: 'user' | 'role' | 'permission' | 'organization';
  id: string;
  name: string;
}

const RESOURCE_TITLES: Record<string, string> = {
  user: 'User Management',
  role: 'Role & RBAC Security',
  organization: 'Organisation Governance',
  workspace_member: 'Workspace Members',
  collection: 'API Collections',
  api: 'API Requests & Endpoints',
  environment: 'Environments & Variables',
  test_case: 'Test Cases & Assertions',
  workflow: 'Workflows & Automation',
  '*': 'System Superuser Wildcard',
};

const RESOURCE_DESCRIPTIONS: Record<string, string> = {
  user: 'Permissions to view, create, edit, and manage user accounts and profiles.',
  role: 'Permissions to define roles, configure permissions, and govern RBAC policies.',
  organization: 'Permissions to govern organization profiles, billing, and settings.',
  workspace_member: 'Permissions to invite, manage, and remove workspace members.',
  collection: 'Permissions to organize API endpoints into collections and folders.',
  api: 'Permissions to create, modify, execute, and delete API requests.',
  environment: 'Permissions to manage environments, global parameters, and secrets.',
  test_case: 'Permissions to build and execute automated test assertions.',
  workflow: 'Permissions to create and run chained multi-step API workflows.',
  '*': 'Full sovereign bypass across all platform resources and operations.',
};

const RESOURCE_ORDER = [
  'organization',
  'user',
  'role',
  'workspace_member',
  'collection',
  'api',
  'environment',
  'workflow',
  'test_case',
  '*',
];

const ACTION_ORDER = ['read', 'create', 'update', 'delete', '*'];

export function formatResourceTitle(resource: string): string {
  if (!resource) return '';
  return RESOURCE_TITLES[resource.toLowerCase()] || resource.toUpperCase();
}

export function getResourceDescription(resource: string): string {
  if (!resource) return '';
  return RESOURCE_DESCRIPTIONS[resource.toLowerCase()] || `Permissions governing ${resource}.`;
}

export function groupPermissionsByResource(
  allPerms: AdminPermission[],
  rolePerms: AdminPermission[],
  rawQuery: string = '',
): PermissionGroup[] {
  const rolePermIds = new Set(rolePerms.map((p) => p.id));
  const query = (rawQuery || '').toLowerCase().trim();

  const groupsMap = new Map<string, AdminPermission[]>();
  for (const perm of allPerms) {
    if (query) {
      const matchesName = (perm.name || '').toLowerCase().includes(query);
      const matchesCode = (perm.code || '').toLowerCase().includes(query);
      const matchesResource = (perm.resource || '').toLowerCase().includes(query);
      const matchesAction = (perm.action || '').toLowerCase().includes(query);
      const matchesDesc = (perm.description || '').toLowerCase().includes(query);
      if (!matchesName && !matchesCode && !matchesResource && !matchesAction && !matchesDesc) {
        continue;
      }
    }

    const res = (perm.resource || 'other').toLowerCase();
    if (!groupsMap.has(res)) {
      groupsMap.set(res, []);
    }
    groupsMap.get(res)!.push(perm);
  }

  const sortedKeys = Array.from(groupsMap.keys()).sort((a, b) => {
    const idxA = RESOURCE_ORDER.indexOf(a.toLowerCase());
    const idxB = RESOURCE_ORDER.indexOf(b.toLowerCase());
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  const result: PermissionGroup[] = [];
  for (const key of sortedKeys) {
    const perms = groupsMap.get(key)!;
    perms.sort((a, b) => {
      const actA = ACTION_ORDER.indexOf((a.action || '').toLowerCase());
      const actB = ACTION_ORDER.indexOf((b.action || '').toLowerCase());
      if (actA !== -1 && actB !== -1) return actA - actB;
      return (a.name || '').localeCompare(b.name || '');
    });

    const grantedCount = perms.filter((p) => rolePermIds.has(p.id)).length;
    result.push({
      resource: key,
      displayName: formatResourceTitle(key),
      description: getResourceDescription(key),
      permissions: perms,
      grantedCount,
      totalCount: perms.length,
    });
  }

  return result;
}

export function groupRoleDetailPermissions(perms: AdminPermission[]) {
  const groupsMap = new Map<string, AdminPermission[]>();
  for (const p of perms) {
    const res = (p.resource || 'other').toLowerCase();
    if (!groupsMap.has(res)) {
      groupsMap.set(res, []);
    }
    groupsMap.get(res)!.push(p);
  }

  return Array.from(groupsMap.entries()).map(([resource, list]) => ({
    resource,
    displayName: formatResourceTitle(resource),
    permissions: list,
  }));
}

export function getOrgAdmin(org: AdminOrganization | null, allUsers: AdminUser[]): AdminUser | null {
  if (!org) return null;
  if (org.ownerId) {
    const match = allUsers.find((u) => u.id === org.ownerId);
    if (match) return match;
  }
  const orgAdmin = allUsers.find(
    (u) =>
      u.organizationId === org.id &&
      u.roles?.some(
        (r) =>
          r.toUpperCase() === 'ADMIN' ||
          r.toUpperCase() === 'SUPER_ADMIN' ||
          r.toUpperCase().includes('ADMIN'),
      ),
  );
  if (orgAdmin) return orgAdmin;

  return allUsers.find((u) => u.organizationId === org.id) || null;
}

export function getUserOrganizations(
  user: AdminUser | null | undefined,
): { id?: string; name: string; slug?: string }[] {
  if (!user) return [];
  if (user.organizations && user.organizations.length > 0) {
    return user.organizations;
  }
  if (user.organizationName) {
    return [{ id: user.organizationId, name: user.organizationName, slug: user.organizationSlug }];
  }
  return [];
}

