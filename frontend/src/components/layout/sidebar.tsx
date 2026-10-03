"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/stores/ui.store";
import { ThemeSwitcher } from "./theme-switcher";
import {
    LayoutDashboard,
    Boxes,
    FolderKanban,
    Layers,
    GitFork,
    History,
    Shield,
    Users,
    ShieldCheck,
    KeyRound,
    Building2,
    Settings,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Sparkles,
    LucideIcon
} from "lucide-react";

import { Can } from "@/components/auth/can";
import { usePermissions } from "@/features/auth/hooks/use-permissions";

interface NavigationItem {
    label: string;
    href: string;
    icon: LucideIcon;
}

const mainNavigation: NavigationItem[] = [
    {
        label: "Overview",
        href: "/",
        icon: LayoutDashboard,
    },
    {
        label: "Workspaces",
        href: "/workspaces",
        icon: Boxes,
    },
    {
        label: "Collections",
        href: "/collections",
        icon: FolderKanban,
    },
    {
        label: "Environments",
        href: "/environments",
        icon: Layers,
    },
    {
        label: "Workflows",
        href: "/workflows",
        icon: GitFork,
    },
    {
        label: "History",
        href: "/history",
        icon: History,
    },
];

const adminSubNavigation: NavigationItem[] = [
    {
        label: "Users",
        href: "/admin/users",
        icon: Users,
    },
    {
        label: "Roles",
        href: "/admin/roles",
        icon: ShieldCheck,
    },
    {
        label: "Permissions",
        href: "/admin/permissions",
        icon: KeyRound,
    },
    {
        label: "Organizations",
        href: "/admin/organizations",
        icon: Building2,
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const { primaryRole, isSuperAdmin, isOrgAdmin } = usePermissions();

    const {
        sidebarOpen,
        toggleSidebar,
        setSidebarOpen,
        adminExpanded,
        toggleAdminExpanded,
        setAdminExpanded,
    } = useUIStore();

    const isAdminActive = pathname.startsWith("/admin");

    const handleAdminClick = () => {
        if (!sidebarOpen) {
            setSidebarOpen(true);
            setAdminExpanded(true);
        } else {
            toggleAdminExpanded();
        }
    };

    let panelTitle = "Guest Panel";
    if (isSuperAdmin) {
        panelTitle = "Super Admin Panel";
    } else if (isOrgAdmin) {
        panelTitle = "Admin Panel";
    } else if (primaryRole && primaryRole !== "GUEST") {
        const formatted = primaryRole.charAt(0).toUpperCase() + primaryRole.slice(1).toLowerCase();
        panelTitle = `${formatted} Panel`;
    }

    return (
        <aside
            className={`
                flex
                h-screen
                shrink-0
                flex-col
                border-r
                border-[rgb(var(--sidebar-border))]/50
                bg-[rgb(var(--sidebar))]/80
                backdrop-blur-xl
                text-[rgb(var(--sidebar-foreground))]
                transition-all
                duration-300
                ease-in-out
                z-30
                ${sidebarOpen ? "w-64" : "w-[72px]"}
            `}
        >
            {/* Brand Header */}
            <div
                className="
                    flex
                    h-16
                    shrink-0
                    items-center
                    border-b
                    border-[rgb(var(--sidebar-border))]/50
                    px-4
                "
            >
                <Link href="/" className="flex items-center gap-3 group">
                    <div
                        className="
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            bg-gradient-to-tr
                            from-[rgb(var(--primary))]
                            to-indigo-500
                            font-bold
                            text-white
                            shadow-md
                            shadow-[rgb(var(--primary))]/20
                            group-hover:scale-105
                            transition-transform
                        "
                    >
                        <Sparkles className="h-5 w-5 text-white animate-pulse" />
                    </div>

                    {sidebarOpen && (
                        <div className="flex flex-col">
                            <span className="text-base font-bold tracking-tight bg-gradient-to-r from-[rgb(var(--foreground))] to-[rgb(var(--muted-foreground))] bg-clip-text text-transparent">
                                ApiAura
                            </span>
                            <span className="text-[10px] uppercase font-mono tracking-wider text-[rgb(var(--primary))] font-semibold">
                                {panelTitle}
                            </span>
                        </div>
                    )}
                </Link>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 space-y-1.5 overflow-y-auto p-3 scrollbar-thin">
                {mainNavigation.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                        pathname === item.href ||
                        (item.href !== "/" && pathname.startsWith(`${item.href}/`));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={sidebarOpen ? undefined : item.label}
                            className={`
                                relative
                                flex
                                h-10
                                items-center
                                gap-3
                                rounded-xl
                                px-3
                                text-sm
                                font-medium
                                transition-all
                                duration-200
                                ${
                                    isActive
                                        ? `
                                            bg-[rgb(var(--primary))]/10
                                            text-[rgb(var(--primary))]
                                            shadow-sm
                                          `
                                        : `
                                            text-[rgb(var(--muted-foreground))]
                                            hover:bg-[rgb(var(--sidebar-accent))]
                                            hover:text-[rgb(var(--foreground))]
                                          `
                                }
                                ${!sidebarOpen ? "justify-center" : ""}
                            `}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[rgb(var(--primary))]" />
                            )}
                            <Icon className={`h-4 w-4 shrink-0 transition-transform ${isActive ? "scale-110" : ""}`} />

                            {sidebarOpen && <span>{item.label}</span>}
                        </Link>
                    );
                })}

                {/* Admin Accordion Group - Guarded by Permission */}
                <Can role={["SUPER_ADMIN", "ADMIN"]}>
                    <div className="pt-3">
                        <button
                            type="button"
                            onClick={handleAdminClick}
                            title={sidebarOpen ? undefined : "Admin Management"}
                            className={`
                                flex
                                h-10
                                w-full
                                items-center
                                justify-between
                                rounded-xl
                                px-3
                                text-sm
                                font-medium
                                transition-colors
                                ${
                                    isAdminActive
                                        ? "bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]"
                                        : "text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--sidebar-accent))] hover:text-[rgb(var(--foreground))]"
                                }
                                ${!sidebarOpen ? "justify-center" : ""}
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <Shield className="h-4 w-4 shrink-0" />
                                {sidebarOpen && <span>Admin</span>}
                            </div>

                            {sidebarOpen && (
                                <ChevronDown
                                    className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                                        adminExpanded ? "rotate-180" : ""
                                    }`}
                                />
                            )}
                        </button>

                        {/* Admin Sub-menu */}
                        {adminExpanded && sidebarOpen && (
                            <div className="mt-1.5 ml-4 space-y-1 border-l-2 border-[rgb(var(--sidebar-border))]/50 pl-2">
                                {adminSubNavigation.map((subItem) => {
                                    const SubIcon = subItem.icon;
                                    const isSubActive = pathname === subItem.href || pathname.startsWith(`${subItem.href}/`);
                                    return (
                                        <Link
                                            key={subItem.href}
                                            href={subItem.href}
                                            className={`
                                                flex
                                                h-9
                                                items-center
                                                gap-2.5
                                                rounded-lg
                                                px-2.5
                                                text-xs
                                                font-medium
                                                transition-colors
                                                ${
                                                    isSubActive
                                                        ? "bg-[rgb(var(--sidebar-accent))] text-[rgb(var(--primary))]"
                                                        : "text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--sidebar-accent))] hover:text-[rgb(var(--foreground))]"
                                                }
                                            `}
                                        >
                                            <SubIcon className="h-3.5 w-3.5" />
                                            <span>{subItem.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </Can>
            </nav>

            {/* Bottom Controls */}
            <div className="space-y-1.5 border-t border-[rgb(var(--sidebar-border))]/50 p-3">
                <div className={sidebarOpen ? "px-1 py-1" : "flex justify-center py-1"}>
                    <ThemeSwitcher collapsed={!sidebarOpen} />
                </div>

                <Link
                    href="/settings"
                    title={sidebarOpen ? undefined : "Settings"}
                    className={`
                        flex
                        h-10
                        items-center
                        gap-3
                        rounded-xl
                        px-3
                        text-sm
                        font-medium
                        text-[rgb(var(--muted-foreground))]
                        transition-colors
                        hover:bg-[rgb(var(--sidebar-accent))]
                        hover:text-[rgb(var(--foreground))]
                        ${!sidebarOpen ? "justify-center" : ""}
                    `}
                >
                    <Settings className="h-4 w-4 shrink-0" />
                    {sidebarOpen && <span>Settings</span>}
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
                        rounded-xl
                        px-3
                        text-sm
                        font-medium
                        text-[rgb(var(--muted-foreground))]
                        transition-colors
                        hover:bg-[rgb(var(--sidebar-accent))]
                        hover:text-[rgb(var(--foreground))]
                        ${!sidebarOpen ? "justify-center" : ""}
                    `}
                >
                    {sidebarOpen ? (
                        <>
                            <ChevronLeft className="h-4 w-4 shrink-0" />
                            <span>Collapse</span>
                        </>
                    ) : (
                        <ChevronRight className="h-4 w-4 shrink-0" />
                    )}
                </button>
            </div>
        </aside>
    );
}