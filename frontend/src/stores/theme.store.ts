import { create } from "zustand";

export type Theme = "dark-blue" | "light-blue";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") return "dark-blue";
  const saved = localStorage.getItem("apiaura_theme") as Theme | null;
  if (saved === "dark-blue" || saved === "light-blue") {
    document.documentElement.dataset.theme = saved;
    return saved;
  }
  document.documentElement.dataset.theme = "dark-blue";
  return "dark-blue";
};

export const useThemeStore = create<ThemeState>((set) => ({
  theme: getInitialTheme(),

  setTheme: (theme) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("apiaura_theme", theme);
      document.documentElement.dataset.theme = theme;
    }
    set({ theme });
  },

  toggleTheme: () => {
    set((state) => {
      const nextTheme = state.theme === "dark-blue" ? "light-blue" : "dark-blue";
      if (typeof window !== "undefined") {
        localStorage.setItem("apiaura_theme", nextTheme);
        document.documentElement.dataset.theme = nextTheme;
      }
      return { theme: nextTheme };
    });
  },
}));