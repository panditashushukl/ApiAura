import Link from "next/link";

import { Card } from "@/components/ui/card";

const sections = [
    {
        title: "Users",
        description:
            "Manage users, status and access.",
        href: "/admin/users",
    },
    {
        title: "Roles",
        description:
            "Manage roles and their permissions.",
        href: "/admin/roles",
    },
    {
        title: "Permissions",
        description:
            "Manage available system permissions.",
        href: "/admin/permissions",
    },
    {
        title: "Organizations",
        description:
            "Manage organizations and ownership.",
        href: "/admin/organizations",
    },
];

export default function AdminPage() {
    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-2xl font-semibold">
                    Administration
                </h1>

                <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">
                    Manage users, access control and
                    organizations.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {sections.map(
                    (section) => (
                        <Link
                            key={section.href}
                            href={section.href}
                        >
                            <Card
                                className="
                                    h-full
                                    p-5
                                    transition
                                    hover:-translate-y-0.5
                                    hover:border-[rgb(var(--primary))]/50
                                "
                            >
                                <h2 className="font-semibold">
                                    {section.title}
                                </h2>

                                <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">
                                    {
                                        section.description
                                    }
                                </p>
                            </Card>
                        </Link>
                    )
                )}
            </div>
        </div>
    );
}