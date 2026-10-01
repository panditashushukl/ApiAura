"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { LoadingState } from "@/components/feedback/loading-state";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    // Listen for unauthorized 401 events from apiClient
    const handleUnauthorized = () => {
      useAuthStore.getState().clearAuth();
      if (pathname !== "/login") {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
    };

    window.addEventListener("apiaura:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("apiaura:unauthorized", handleUnauthorized);
    };
  }, [pathname, router]);

  useEffect(() => {
    if (requireAuth && !isLoading && !isAuthenticated && pathname !== "/login") {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isLoading, pathname, requireAuth, router]);

  if (requireAuth && (isLoading || (!isAuthenticated && pathname !== "/login"))) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[rgb(var(--background))] text-[rgb(var(--foreground))]">
        <LoadingState message="Authenticating session..." size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}
