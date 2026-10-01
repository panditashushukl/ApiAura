"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { loginApi } from "../api/auth.api";
import { useAuthStore } from "@/stores/auth.store";
import type { LoginRequest, AuthResponse } from "../types/auth.types";
import { ApiError } from "@/lib/api/client";

export function useLogin() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation<AuthResponse, ApiError, LoginRequest>({
    mutationFn: (request: LoginRequest) => loginApi(request),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      router.push("/");
    },
  });
}