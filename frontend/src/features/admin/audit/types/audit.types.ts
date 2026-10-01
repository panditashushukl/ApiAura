export interface AuditLogUser {
  id: string;
  email: string;
  fullName?: string;
}

export interface AuditLog {
  id: string;
  user?: AuditLogUser | null;
  action: string;
  resourceType?: string | null;
  resourceId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: string | null;
  createdAt: string;
}

export interface PageAuditLogResponse {
  content: AuditLog[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
