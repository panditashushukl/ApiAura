"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { WorkspaceSelector } from "@/features/workspace/components/workspace-selector";
import { OrganizationSelector } from "@/features/admin/organizations/components/organization-selector";
import { UserProfileModal } from "@/features/user/components/user-profile-modal";
import { useUIStore } from "@/stores/ui.store";
import { useAuthStore } from "@/stores/auth.store";
import { logoutApi } from "@/features/auth/api/auth.api";
import { Search, Menu, User, Settings, LogOut, ShieldCheck } from "lucide-react";

export function Topbar() {
    const router = useRouter();
    const { toggleMobileSidebar } = useUIStore();
    const { user, clearAuth } = useAuthStore();
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

    const handleLogout = async () => {
        try {
            await logoutApi();
        } catch {
            // ignore network error on logout
        } finally {
            clearAuth();
            setUserMenuOpen(false);
            router.push("/login");
        }
    };

    return (
        <>
            <header
                className="
                    sticky
                    top-0
                    z-20
                    flex
                    h-16
                    shrink-0
                    items-center
                    justify-between
                    border-b
                    border-[rgb(var(--border))]/50
                    bg-[rgb(var(--background))]/75
                    backdrop-blur-xl
                    px-4
                    lg:px-6
                    transition-colors
                "
            >
                <div className="flex items-center gap-3">
                    {/* Mobile menu button */}
                    <button
                        type="button"
                        onClick={toggleMobileSidebar}
                        className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-[rgb(var(--border))]/50
                            bg-[rgb(var(--card))]/50
                            text-[rgb(var(--muted-foreground))]
                            transition-colors
                            hover:bg-[rgb(var(--secondary))]
                            hover:text-[rgb(var(--foreground))]
                            lg:hidden
                        "
                        aria-label="Open navigation"
                    >
                        <Menu className="h-4 w-4" />
                    </button>

                    {/* Dual Selectors: Organization & Workspace */}
                    <div className="flex items-center gap-2">
                        <OrganizationSelector />
                        <WorkspaceSelector />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Global Command / Search Trigger */}
                    <button
                        type="button"
                        className="
                            hidden
                            h-9
                            min-w-48
                            items-center
                            justify-between
                            rounded-xl
                            border
                            border-[rgb(var(--border))]/50
                            bg-[rgb(var(--card))]/40
                            px-3
                            text-xs
                            text-[rgb(var(--muted-foreground))]
                            transition-all
                            hover:bg-[rgb(var(--card))]
                            hover:text-[rgb(var(--foreground))]
                            hover:border-[rgb(var(--primary))]/30
                            md:flex
                            shadow-xs
                        "
                    >
                        <span className="flex items-center gap-2">
                            <Search className="h-3.5 w-3.5 text-[rgb(var(--muted-foreground))]" />
                            <span>Search endpoints...</span>
                        </span>

                        <kbd
                            className="
                                flex
                                items-center
                                gap-0.5
                                rounded-md
                                border
                                border-[rgb(var(--border))]/60
                                bg-[rgb(var(--secondary))]/50
                                px-1.5
                                py-0.5
                                text-[10px]
                                font-mono
                                text-[rgb(var(--muted-foreground))]
                            "
                        >
                            ⌘ K
                        </kbd>
                    </button>

                    {/* User Avatar & Enhanced Dropdown */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setUserMenuOpen((prev) => !prev)}
                            className="
                                flex
                                h-9
                                w-9
                                items-center
                                justify-center
                                rounded-xl
                                bg-gradient-to-tr
                                from-[rgb(var(--primary))]
                                to-indigo-500
                                text-xs
                                font-bold
                                text-white
                                shadow-md
                                shadow-[rgb(var(--primary))]/20
                                ring-2
                                ring-[rgb(var(--primary))]/20
                                hover:scale-105
                                transition-transform
                            "
                            aria-label="User menu"
                            title={user?.name || "User Profile"}
                        >
                            {userInitial}
                        </button>

                        {userMenuOpen && (
                            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-[rgb(var(--border))]/50 bg-[rgb(var(--card))]/90 p-2 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150 glass-dropdown">
                                <div className="border-b border-[rgb(var(--border))]/50 px-3 py-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[rgb(var(--primary))] to-indigo-500 text-white font-bold text-xs shrink-0">
                                            {userInitial}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-xs text-[rgb(var(--foreground))] truncate">
                                                {user?.name || "Guest User"}
                                            </p>
                                            <p className="text-[11px] text-[rgb(var(--muted-foreground))] truncate">
                                                {user?.email || "guest@apiaura.dev"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Role Pill */}
                                    <div className="mt-2.5 flex items-center gap-1.5">
                                        <ShieldCheck className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />
                                        <span className="rounded-full bg-[rgb(var(--primary))]/10 px-2 py-0.5 text-[10px] font-semibold text-[rgb(var(--primary))]">
                                            {user?.roles?.[0] || "DEVELOPER"}
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-1.5 space-y-0.5">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setUserMenuOpen(false);
                                            setIsProfileModalOpen(true);
                                        }}
                                        className="flex h-9 w-full items-center gap-2.5 rounded-xl px-3 text-xs font-medium text-[rgb(var(--foreground))] hover:bg-[rgb(var(--secondary))] transition-colors"
                                    >
                                        <User className="h-3.5 w-3.5 text-[rgb(var(--muted-foreground))]" />
                                        <span>Edit Profile</span>
                                    </button>

                                    <Link
                                        href="/settings"
                                        onClick={() => setUserMenuOpen(false)}
                                        className="flex h-9 w-full items-center gap-2.5 rounded-xl px-3 text-xs font-medium text-[rgb(var(--foreground))] hover:bg-[rgb(var(--secondary))] transition-colors"
                                    >
                                        <Settings className="h-3.5 w-3.5 text-[rgb(var(--muted-foreground))]" />
                                        <span>Preferences & Settings</span>
                                    </Link>

                                    <div className="border-t border-[rgb(var(--border))]/50 my-1" />

                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="flex h-9 w-full items-center gap-2.5 rounded-xl px-3 text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors"
                                    >
                                        <LogOut className="h-3.5 w-3.5" />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Self-CRUD User Profile Modal */}
            <UserProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
            />
        </>
    );
}