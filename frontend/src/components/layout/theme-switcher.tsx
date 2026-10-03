"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Sun, Moon } from "lucide-react";
import { useThemeStore } from "@/stores/theme.store";

const emptySubscribe = () => () => {};

interface ThemeSwitcherProps {
  collapsed?: boolean;
}

export function ThemeSwitcher({ collapsed = false }: ThemeSwitcherProps) {
  const { theme, toggleTheme } = useThemeStore();

  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.dataset.theme = theme;
    }
  }, [theme]);

  const isDark = theme === "dark-blue";

  if (!isClient) {
    return collapsed ? (
      <div className="h-9 w-9 rounded-xl bg-[rgb(var(--muted))]/50 border border-[rgb(var(--border))]/50" />
    ) : (
      <div className="h-8 w-16 rounded-full bg-[rgb(var(--muted))]/50 border border-[rgb(var(--border))]/50" />
    );
  }

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-[rgb(var(--border))]/50 bg-[rgb(var(--secondary))]/60 text-[rgb(var(--foreground))] transition-all hover:bg-[rgb(var(--secondary))] hover:border-[rgb(var(--primary))]/40 hover:scale-105 cursor-pointer shadow-xs"
        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        aria-label="Toggle dark and light theme"
      >
        {isDark ? (
          <Moon className="h-4 w-4 text-indigo-400" />
        ) : (
          <Sun className="h-4 w-4 text-amber-500" />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="group relative flex h-8 w-16 items-center rounded-full border border-[rgb(var(--border))]/60 bg-[rgb(var(--secondary))]/70 p-1 transition-colors hover:border-[rgb(var(--primary))]/50 focus:outline-none shadow-inner cursor-pointer"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle dark and light theme"
    >
      {/* Track Icons */}
      <div className="flex w-full items-center justify-between px-1 text-[rgb(var(--muted-foreground))]">
        <Moon className={`h-3.5 w-3.5 transition-colors ${isDark ? "text-indigo-400" : "opacity-40"}`} />
        <Sun className={`h-3.5 w-3.5 transition-colors ${!isDark ? "text-amber-500" : "opacity-40"}`} />
      </div>

      {/* Sliding Knob */}
      <span
        className={`absolute top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[rgb(var(--card))] border border-[rgb(var(--border))]/80 text-[rgb(var(--primary))] shadow-md transition-transform duration-300 ease-in-out ${
          isDark ? "translate-x-0" : "translate-x-8"
        }`}
      >
        {isDark ? (
          <Moon className="h-3.5 w-3.5 text-indigo-400" />
        ) : (
          <Sun className="h-3.5 w-3.5 text-amber-500" />
        )}
      </span>
    </button>
  );
}