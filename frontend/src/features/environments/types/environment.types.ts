export type EnvironmentStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export interface Environment {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  description?: string;
  status: EnvironmentStatus;
  active: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface EnvironmentVariable {
  id: string;
  environmentId: string;
  variableKey: string;
  variableValue?: string | null;
  secret: boolean;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEnvironmentRequest {
  name: string;
  description?: string;
}

export interface UpdateEnvironmentRequest {
  name?: string;
  description?: string;
}

export interface CreateEnvironmentVariableRequest {
  variableKey: string;
  variableValue?: string;
  secretValue?: string;
  secret?: boolean;
  enabled?: boolean;
}

export interface UpdateEnvironmentVariableRequest {
  variableKey?: string;
  variableValue?: string;
  secretValue?: string;
  secret?: boolean;
  enabled?: boolean;
}
