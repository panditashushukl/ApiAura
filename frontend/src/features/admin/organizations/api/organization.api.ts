import { api } from "@/lib/api/client";
import type {
  ApiResponse,
  CreateOrganizationRequest,
  Organization,
  UpdateOrganizationRequest,
} from "../types/organization.types";

export async function getOrganizations(): Promise<Organization[]> {
  const response = await api.get<ApiResponse<Organization[]>>("/organizations");
  return response.data;
}

export async function getOrganization(organizationId: string): Promise<Organization> {
  const response = await api.get<ApiResponse<Organization>>(`/organizations/${organizationId}`);
  return response.data;
}

export async function createOrganization(request: CreateOrganizationRequest): Promise<Organization> {
  const response = await api.post<ApiResponse<Organization>>("/organizations", request);
  return response.data;
}

export async function updateOrganization(
  organizationId: string,
  request: UpdateOrganizationRequest
): Promise<Organization> {
  const response = await api.patch<ApiResponse<Organization>>(
    `/organizations/${organizationId}`,
    request
  );
  return response.data;
}

export async function deleteOrganization(organizationId: string): Promise<void> {
  await api.delete<ApiResponse<void>>(`/organizations/${organizationId}`);
}