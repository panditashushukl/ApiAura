"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useUIStore } from "@/stores/ui.store";

interface NavigationItem {
    label: string;
    href: string;
    icon: string;
}

const navigation: NavigationItem[] = [
    {
        label: "Overview",
        href: "/",
        icon: "⌂",
    },
    {
        label: "Collections",
        href: "/collections",
        icon: "▣",
    },
    {
        label: "Environments",
        href: "/environments",
        icon: "◈",
    },
    {
        label: "Workflows",
        href: "/workflows",
        icon: "◇",
    },
    {
        label: "Tests",
        href: "/tests",
        icon: "✓",
    },
    {
        label: "History",
        href: "/history",
        icon: "◷",
    },
    {
        label: "AI Assistant",
        href: "/ai",
        icon: "✦",
    },
    {
        label: "Documentation",
        href: "/documentation",
        icon: "▤",
    },
    {
        label: "Administration",
        href: "/admin",
        icon: "⚙",
    },
];

export function Sidebar() {
    const pathname = usePathname();

    const {
        sidebarOpen,
        toggleSidebar,
    } = useUIStore();

    return (
        <aside
            className={`
                flex
                h-screen
                shrink-0
                flex-col
                border-r
                border-[rgb(var(--sidebar-border))]
                bg-[rgb(var(--sidebar))]
                text-[rgb(var(--sidebar-foreground))]
                transition-[width]
                duration-200
                ${sidebarOpen ? "w-64" : "w-[72px]"}
            `}
        >
            {/* Brand */}
            <div
                className="
                    flex
                    h-16
                    shrink-0
                    items-center
                    border-b
                    border-[rgb(var(--sidebar-border))]
                    px-4
                "
            >
                <div className="flex items-center gap-3">
                    <div
                        className="
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-[rgb(var(--primary))]
                            font-bold
                            text-white
                        "
                    >
                        A
                    </div>

                    {sidebarOpen && (
                        <span className="text-lg font-semibold">
                            ApiAura
                        </span>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 overflow-y-auto p-3">
                {navigation.map((item) => {
                    const isActive =
                        pathname === item.href ||
                        (
                            item.href !== "/" &&
                            pathname.startsWith(
                                `${item.href}/`
                            )
                        );

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={
                                sidebarOpen
                                    ? undefined
                                    : item.label
                            }
                            className={`
                                flex
                                h-10
                                items-center
                                gap-3
                                rounded-lg
                                px-3
                                text-sm
                                transition-colors
                                ${
                                    isActive
                                        ? `
                                            bg-[rgb(var(--sidebar-accent))]
                                            text-[rgb(var(--primary))]
                                          `
                                        : `
                                            text-[rgb(var(--muted-foreground))]
                                            hover:bg-[rgb(var(--sidebar-accent))]
                                            hover:text-[rgb(var(--foreground))]
                                          `
                                }
                                ${
                                    !sidebarOpen
                                        ? "justify-center"
                                        : ""
                                }
                            `}
                        >
                            <span
                                className="
                                    flex
                                    h-5
                                    w-5
                                    shrink-0
                                    items-center
                                    justify-center
                                    text-base
                                "
                            >
                                {item.icon}
                            </span>

                            {sidebarOpen && (
                                <span>
                                    {item.label}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Settings + Collapse */}
            <div
                className="
                    space-y-1
                    border-t
                    border-[rgb(var(--sidebar-border))]
                    p-3
                "
            >
                <Link
                    href="/settings"
                    title={
                        sidebarOpen
                            ? undefined
                            : "Settings"
                    }
                    className={`
                        flex
                        h-10
                        items-center
                        gap-3
                        rounded-lg
                        px-3
                        text-sm
                        text-[rgb(var(--muted-foreground))]
                        transition-colors
                        hover:bg-[rgb(var(--sidebar-accent))]
                        hover:text-[rgb(var(--foreground))]
                        ${
                            !sidebarOpen
                                ? "justify-center"
                                : ""
                        }
                    `}
                >
                    <span>⚙</span>

                    {sidebarOpen && (
                        <span>Settings</span>
                    )}
                </Link>

                <button
                    type="button"
                    onClick={toggleSidebar}
                    className={`
                        flex
                        h-10
                        w-full
                        items-center
                        gap-3
                        rounded-lg
                        px-3
                        text-sm
                        text-[rgb(var(--muted-foreground))]
                        transition-colors
                        hover:bg-[rgb(var(--sidebar-accent))]
                        hover:text-[rgb(var(--foreground))]
                        ${
                            !sidebarOpen
                                ? "justify-center"
                                : ""
                        }
                    `}
                >
                    <span>
                        {sidebarOpen ? "‹" : "›"}
                    </span>

                    {sidebarOpen && (
                        <span>
                            Collapse
                        </span>
                    )}
                </button>
            </div>
        </aside>
    );
}