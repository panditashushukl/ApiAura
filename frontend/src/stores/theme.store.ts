import { create } from "zustand";

export type Theme =
    | "dark-blue"
    | "light-blue";

interface ThemeState {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

export const useThemeStore =
    create<ThemeState>((set) => ({
        theme: "dark-blue",

        setTheme: (theme) => {
            set({ theme });

            document.documentElement.dataset.theme =
                theme;
        },

        toggleTheme: () => {
            set((state) => {
                const nextTheme =
                    state.theme === "dark-blue"
                        ? "light-blue"
                        : "dark-blue";

                document.documentElement.dataset.theme =
                    nextTheme;

                return {
                    theme: nextTheme,
                };
            });
        },
    }));