import { apiClient } from "@/lib/api/client";
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RefreshTokenRequest,
  RegisterRequest,
} from "../types/auth.types";

export async function loginApi(
  request: LoginRequest
): Promise<AuthResponse> {
  const response = await apiClient<ApiResponse<AuthResponse>>("/auth/login", {
    method: "POST",
    data: request,
  });

  return response.data;
}

export async function registerApi(
  request: RegisterRequest
): Promise<AuthResponse> {
  const response = await apiClient<ApiResponse<AuthResponse>>("/auth/register", {
    method: "POST",
    data: request,
  });

  return response.data;
}

export async function refreshApi(
  request?: RefreshTokenRequest
): Promise<AuthResponse> {
  const response = await apiClient<ApiResponse<AuthResponse>>("/auth/refresh", {
    method: "POST",
    data: request ?? {},
  });

  return response.data;
}

export async function logoutApi(
  request?: RefreshTokenRequest
): Promise<void> {
  await apiClient<ApiResponse<VoidFunction>>("/auth/logout", {
    method: "POST",
    data: request ?? {},
  });
}

export async function logoutAllApi(): Promise<void> {
  await apiClient<ApiResponse<void>>("/auth/logout-all", {
    method: "POST",
  });
}