"use client";

import { WorkspaceSelector } from "@/features/workspace/components/workspace-selector";
import { ThemeSwitcher } from "./theme-switcher";
import { useUIStore } from "@/stores/ui.store";

export function Topbar() {
    const {
        toggleMobileSidebar,
    } = useUIStore();

    return (
        <header
            className="
                flex
                h-16
                shrink-0
                items-center
                justify-between
                border-b
                border-[rgb(var(--border))]
                bg-[rgb(var(--background))]
                px-4
                lg:px-6
            "
        >
            <div className="flex items-center gap-3">
                {/* Mobile menu */}
                <button
                    type="button"
                    onClick={
                        toggleMobileSidebar
                    }
                    className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-lg
                        border
                        border-[rgb(var(--border))]
                        text-[rgb(var(--muted-foreground))]
                        transition-colors
                        hover:bg-[rgb(var(--secondary))]
                        hover:text-[rgb(var(--foreground))]
                        lg:hidden
                    "
                    aria-label="Open navigation"
                >
                    ☰
                </button>

                <WorkspaceSelector />
            </div>

            <div className="flex items-center gap-3">
                {/* Command/search */}
                <button
                    type="button"
                    className="
                        hidden
                        h-9
                        min-w-48
                        items-center
                        justify-between
                        rounded-lg
                        border
                        border-[rgb(var(--border))]
                        bg-[rgb(var(--card))]
                        px-3
                        text-sm
                        text-[rgb(var(--muted-foreground))]
                        transition-colors
                        hover:bg-[rgb(var(--secondary))]
                        md:flex
                    "
                >
                    <span>
                        Search...
                    </span>

                    <kbd
                        className="
                            rounded
                            border
                            border-[rgb(var(--border))]
                            px-1.5
                            py-0.5
                            text-xs
                        "
                    >
                        ⌘ K
                    </kbd>
                </button>

                <ThemeSwitcher />

                {/* User */}
                <button
                    type="button"
                    className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-full
                        bg-[rgb(var(--primary))]
                        text-sm
                        font-semibold
                        text-white
                    "
                    aria-label="User menu"
                >
                    U
                </button>
            </div>
        </header>
    );
}