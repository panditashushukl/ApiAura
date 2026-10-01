"use client";

import { ReactNode } from "react";

import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { useUIStore } from "@/stores/ui.store";

interface AppShellProps {
    children: ReactNode;
}

export function AppShell({
    children,
}: AppShellProps) {
    const {
        mobileSidebarOpen,
        setMobileSidebarOpen,
    } = useUIStore();

    return (
        <div
            className="
                flex
                h-screen
                overflow-hidden
                bg-[rgb(var(--background))]
                text-[rgb(var(--foreground))]
            "
        >
            {/* Desktop sidebar */}
            <div className="hidden lg:flex">
                <Sidebar />
            </div>

            {/* Mobile sidebar */}
            {mobileSidebarOpen && (
                <>
                    <div
                        className="
                            fixed
                            inset-0
                            z-40
                            bg-black/50
                            lg:hidden
                        "
                        onClick={() =>
                            setMobileSidebarOpen(
                                false
                            )
                        }
                    />

                    <div
                        className="
                            fixed
                            inset-y-0
                            left-0
                            z-50
                            lg:hidden
                        "
                    >
                        <Sidebar />
                    </div>
                </>
            )}

            <div className="flex min-w-0 flex-1 flex-col">
                <Topbar />

                <main
                    className="
                        min-h-0
                        flex-1
                        overflow-auto
                    "
                >
                    {children}
                </main>
            </div>
        </div>
    );
}