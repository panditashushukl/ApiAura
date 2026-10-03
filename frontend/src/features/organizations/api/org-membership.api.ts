import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/features/auth/types/auth.types";

export interface MembershipRequestResponse {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  organizationId: string;
  organizationName: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  message?: string | null;
  requestedAt: string;
  reviewedAt?: string | null;
  reviewedByName?: string | null;
}

export async function createJoinRequest(
  organizationId: string,
  message?: string
): Promise<MembershipRequestResponse> {
  const response = await apiClient<ApiResponse<MembershipRequestResponse>>(
    `/organizations/${organizationId}/join-requests`,
    {
      method: "POST",
      data: message ? { message } : {},
    }
  );
  return response.data;
}

export async function getOrganizationJoinRequests(
  organizationId: string
): Promise<MembershipRequestResponse[]> {
  const response = await apiClient<ApiResponse<MembershipRequestResponse[]>>(
    `/organizations/${organizationId}/join-requests`
  );
  return response.data;
}

export async function getMyJoinRequests(): Promise<MembershipRequestResponse[]> {
  const response = await apiClient<ApiResponse<MembershipRequestResponse[]>>(
    "/organizations/join-requests/my"
  );
  return response.data;
}

export async function approveJoinRequest(
  requestId: string
): Promise<MembershipRequestResponse> {
  const response = await apiClient<ApiResponse<MembershipRequestResponse>>(
    `/organizations/join-requests/${requestId}/approve`,
    {
      method: "POST",
    }
  );
  return response.data;
}

export async function rejectJoinRequest(
  requestId: string
): Promise<MembershipRequestResponse> {
  const response = await apiClient<ApiResponse<MembershipRequestResponse>>(
    `/organizations/join-requests/${requestId}/reject`,
    {
      method: "POST",
    }
  );
  return response.data;
}
