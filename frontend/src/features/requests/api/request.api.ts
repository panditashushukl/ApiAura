import { apiClient } from "@/lib/api/client";
import type {
  ApiResponse,
  ApiRequest,
  CreateApiRequest,
  CreateQueryParameterRequest,
  CreateRequestHeaderRequest,
  PageResponse,
  QueryParameter,
  RequestHeader,
  UpdateApiRequest,
} from "../types/request.types";

export async function getRequestsByCollection(
  collectionId: string,
  page = 0,
  size = 100
): Promise<ApiRequest[]> {
  const response = await apiClient<ApiResponse<PageResponse<ApiRequest>> | ApiResponse<ApiRequest[]>>(
    `/collections/${collectionId}/requests?page=${page}&size=${size}`
  );

  const data = response.data;
  if (Array.isArray(data)) return data;
  return data.content || [];
}

export async function getRequest(requestId: string): Promise<ApiRequest> {
  const response = await apiClient<ApiResponse<ApiRequest>>(`/requests/${requestId}`);
  return response.data;
}

export async function createRequest(
  collectionId: string,
  request: CreateApiRequest
): Promise<ApiRequest> {
  const response = await apiClient<ApiResponse<ApiRequest>>(
    `/collections/${collectionId}/requests`,
    {
      method: "POST",
      data: JSON.stringify(request),
    }
  );
  return response.data;
}

export async function updateRequest(
  requestId: string,
  request: UpdateApiRequest
): Promise<ApiRequest> {
  const response = await apiClient<ApiResponse<ApiRequest>>(`/requests/${requestId}`, {
    method: "PATCH",
    data: JSON.stringify(request),
  });
  return response.data;
}

export async function deleteRequest(requestId: string): Promise<void> {
  await apiClient<ApiResponse<void>>(`/requests/${requestId}`, {
    method: "DELETE",
  });
}

// Request Headers API
export async function getRequestHeaders(requestId: string): Promise<RequestHeader[]> {
  const response = await apiClient<ApiResponse<RequestHeader[]>>(`/requests/${requestId}/headers`);
  return response.data;
}

export async function createRequestHeader(
  requestId: string,
  header: CreateRequestHeaderRequest
): Promise<RequestHeader> {
  const response = await apiClient<ApiResponse<RequestHeader>>(`/requests/${requestId}/headers`, {
    method: "POST",
    data: JSON.stringify(header),
  });
  return response.data;
}

export async function deleteRequestHeader(
  requestId: string,
  headerId: string
): Promise<void> {
  await apiClient<ApiResponse<void>>(`/requests/${requestId}/headers/${headerId}`, {
    method: "DELETE",
  });
}

// Query Parameters API
export async function getQueryParameters(requestId: string): Promise<QueryParameter[]> {
  const response = await apiClient<ApiResponse<QueryParameter[]>>(`/requests/${requestId}/query-parameters`);
  return response.data;
}

export async function createQueryParameter(
  requestId: string,
  param: CreateQueryParameterRequest
): Promise<QueryParameter> {
  const response = await apiClient<ApiResponse<QueryParameter>>(`/requests/${requestId}/query-parameters`, {
    method: "POST",
    data: JSON.stringify(param),
  });
  return response.data;
}

export async function deleteQueryParameter(
  requestId: string,
  parameterId: string
): Promise<void> {
  await apiClient<ApiResponse<void>>(`/requests/${requestId}/query-parameters/${parameterId}`, {
    method: "DELETE",
  });
}
