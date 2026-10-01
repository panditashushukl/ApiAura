"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { loginApi, logoutApi, refreshApi, registerApi } from "../api/auth.api";
import type { LoginRequest, RegisterRequest } from "../types/auth.types";

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, setAuth, clearAuth, setLoading } =
    useAuthStore();

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => loginApi(data),
    onSuccess: (res) => {
      setAuth(res.user, res.accessToken);
      router.push("/");
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => registerApi(data),
    onSuccess: (res) => {
      setAuth(res.user, res.accessToken);
      router.push("/");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => logoutApi(),
    onSettled: () => {
      clearAuth();
      router.push("/login");
    },
  });

  const refreshSession = async () => {
    try {
      setLoading(true);
      const res = await refreshApi();
      if (res && res.user) {
        setAuth(res.user, res.accessToken);
        return true;
      }
    } catch {
      clearAuth();
    } finally {
      setLoading(false);
    }
    return false;
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
    refreshSession,
  };
}
