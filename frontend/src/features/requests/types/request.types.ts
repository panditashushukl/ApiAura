export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

export type BodyType = "NONE" | "JSON" | "FORM_DATA" | "URL_ENCODED" | "RAW" | "XML";

export interface RequestHeader {
  id: string;
  requestId: string;
  headerKey: string;
  headerValue: string;
  enabled: boolean;
  secret: boolean;
  sortOrder?: number;
}

export interface QueryParameter {
  id: string;
  requestId: string;
  parameterKey: string;
  parameterValue: string;
  enabled: boolean;
  description?: string | null;
  sortOrder?: number;
}

export interface PathParameter {
  id: string;
  requestId: string;
  parameterKey: string;
  parameterValue: string;
  enabled: boolean;
  description?: string | null;
}

export interface ApiRequest {
  id: string;
  collectionId: string;
  folderId?: string | null;
  parentRequestId?: string | null;
  name: string;
  method: HttpMethod;
  url: string;
  description?: string | null;
  documentation?: string | null;
  bodyType: BodyType;
  body?: string | null;
  enabled: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApiRequest {
  name: string;
  method: HttpMethod;
  url: string;
  folderId?: string;
  description?: string;
  bodyType?: BodyType;
  body?: string;
}

export interface UpdateApiRequest {
  name?: string;
  method?: HttpMethod;
  url?: string;
  description?: string;
  bodyType?: BodyType;
  body?: string;
  enabled?: boolean;
}

export interface CreateRequestHeaderRequest {
  headerKey: string;
  headerValue: string;
  enabled?: boolean;
  secret?: boolean;
}

export interface CreateQueryParameterRequest {
  parameterKey: string;
  parameterValue: string;
  enabled?: boolean;
  description?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
