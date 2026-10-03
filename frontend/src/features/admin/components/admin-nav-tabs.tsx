"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNavTabs() {
    const pathname = usePathname();

    const tabs = [
        { label: "Users", href: "/admin/users" },
        { label: "Permissions", href: "/admin/permissions" },
        { label: "Roles", href: "/admin/roles" },
        { label: "Organizations", href: "/admin/organizations" },
    ];

    return (
        <div className="flex items-center gap-2 border-b border-[rgb(var(--border))] pb-3 mb-6">
            <div className="flex rounded-lg bg-[rgb(var(--card))] border border-[rgb(var(--border))] p-1">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition ${
                                isActive
                                    ? "bg-[rgb(var(--primary))] text-white shadow-sm"
                                    : "text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
                            }`}
                        >
                            {tab.label}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
