"use client";

import { useThemeStore } from "@/stores/theme.store";

export function ThemeSwitcher() {
    const {
        theme,
        toggleTheme,
    } = useThemeStore();

    return (
        <button
            type="button"
            onClick={toggleTheme}
            className="
                relative
                h-8
                w-16
                rounded-full
                border
                bg-[rgb(var(--secondary))]
                transition-colors
            "
            aria-label="Toggle theme"
        >
            <span
                className={`
                    absolute
                    top-1
                    h-6
                    w-6
                    rounded-full
                    bg-[rgb(var(--primary))]
                    transition-transform
                    duration-200
                    ${
                        theme === "light-blue"
                            ? "translate-x-8"
                            : "translate-x-1"
                    }
                `}
            />
        </button>
    );
}