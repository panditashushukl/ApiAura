import { create } from "zustand";
import { User } from "@/features/auth/types/auth.types";
import { setApiAccessToken } from "@/lib/api/client";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: string[];
  roles: string[];

  setAuth: (user: User, accessToken?: string | null) => void;
  updateUser: (userPartial: Partial<User>) => void;
  setPermissions: (permissions: string[]) => void;
  setRoles: (roles: string[]) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

// Initial state recovery from localStorage for smooth page reload
const getInitialState = () => {
  if (typeof window === "undefined") {
    return { user: null, token: null, isAuth: false };
  }
  try {
    const storedUser = localStorage.getItem("auth_user");
    const storedToken = localStorage.getItem("auth_token");
    if (storedUser && storedToken) {
      const user = JSON.parse(storedUser);
      setApiAccessToken(storedToken);
      return { user, token: storedToken, isAuth: true };
    }
  } catch (err) {
    console.error("Failed to restore initial auth state", err);
  }
  return { user: null, token: null, isAuth: false };
};

const initial = getInitialState();

export const useAuthStore = create<AuthState>((set) => ({
  user: initial.user,
  accessToken: initial.token,
  isAuthenticated: initial.isAuth,
  isLoading: false,
  permissions: initial.user?.permissions ?? [],
  roles: initial.user?.roles ?? [],

  setAuth: (user: User, accessToken?: string | null) => {
    const token = accessToken ?? null;
    if (token) {
      setApiAccessToken(token);
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_user", JSON.stringify(user));
    }

    set({
      user,
      accessToken: token,
      isAuthenticated: true,
      isLoading: false,
      permissions: user.permissions ?? [],
      roles: user.roles ?? [],
    });
  },

  updateUser: (userPartial: Partial<User>) =>
    set((state) => {
      if (!state.user) return state;
      const updated = { ...state.user, ...userPartial };
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_user", JSON.stringify(updated));
      }
      return { user: updated };
    }),

  setPermissions: (permissions: string[]) =>
    set({ permissions }),

  setRoles: (roles: string[]) =>
    set({ roles }),

  clearAuth: () => {
    setApiAccessToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_token");
    }
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      permissions: [],
      roles: [],
    });
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));
