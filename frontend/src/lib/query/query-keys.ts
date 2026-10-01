export const queryKeys = {
  // Auth & Current User
  auth: {
    me: ["auth", "me"] as const,
    session: ["auth", "session"] as const,
  },

  // Users (Admin)
  users: {
    all: ["users"] as const,
    list: (filters?: Record<string, unknown>) => ["users", "list", filters] as const,
    detail: (id: string) => ["users", "detail", id] as const,
  },

  // Roles (Admin)
  roles: {
    all: ["roles"] as const,
    detail: (id: string) => ["roles", "detail", id] as const,
    permissions: (roleId: string) => ["roles", "detail", roleId, "permissions"] as const,
  },

  // Permissions (Admin)
  permissions: {
    all: ["permissions"] as const,
    detail: (id: string) => ["permissions", "detail", id] as const,
    byResource: (resource: string) => ["permissions", "resource", resource] as const,
  },

  // Organizations
  organizations: {
    all: ["organizations"] as const,
    mine: ["organizations", "mine"] as const,
    detail: (id: string) => ["organizations", "detail", id] as const,
    workspaces: (orgId: string) => ["organizations", "detail", orgId, "workspaces"] as const,
  },

  // Workspaces
  workspaces: {
    all: ["workspaces"] as const,
    mine: ["workspaces", "mine"] as const,
    detail: (id: string) => ["workspaces", "detail", id] as const,
    byOrg: (orgId: string) => ["workspaces", "organization", orgId] as const,
  },

  // Collections
  collections: {
    all: (workspaceId: string) => ["workspaces", workspaceId, "collections"] as const,
    detail: (id: string) => ["collections", "detail", id] as const,
  },

  // Requests
  requests: {
    byCollection: (collectionId: string) => ["collections", collectionId, "requests"] as const,
    detail: (id: string) => ["requests", "detail", id] as const,
    queryParams: (requestId: string) => ["requests", requestId, "query-parameters"] as const,
    headers: (requestId: string) => ["requests", requestId, "headers"] as const,
    pathParams: (requestId: string) => ["requests", requestId, "path-parameters"] as const,
  },

  // Environments
  environments: {
    all: (workspaceId: string) => ["workspaces", workspaceId, "environments"] as const,
    detail: (id: string) => ["environments", "detail", id] as const,
    variables: (envId: string) => ["environments", envId, "variables"] as const,
  },

  // History
  history: {
    all: (filters?: Record<string, unknown>) => ["history", filters] as const,
    byRequest: (requestId: string) => ["history", "request", requestId] as const,
    byStatus: (status: string) => ["history", "status", status] as const,
    detail: (id: string) => ["history", "detail", id] as const,
  },

  // Workflows
  workflows: {
    all: (workspaceId: string) => ["workspaces", workspaceId, "workflows"] as const,
    detail: (id: string) => ["workflows", "detail", id] as const,
  },

  // Testing
  testing: {
    suites: (workspaceId: string) => ["workspaces", workspaceId, "test-suites"] as const,
    detail: (id: string) => ["testing", "detail", id] as const,
    history: (suiteId: string) => ["testing", "history", suiteId] as const,
  },

  // AI Assistant
  ai: {
    sessions: () => ["ai", "sessions"] as const,
    messages: (sessionId: string) => ["ai", "sessions", sessionId, "messages"] as const,
  },

  // Audit Logs
  audit: {
    all: (filters?: Record<string, unknown>) => ["audit", filters] as const,
  },
};
