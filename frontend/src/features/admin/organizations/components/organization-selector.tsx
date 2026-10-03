"use client";

import { useEffect } from "react";
import { useOrganizations } from "../hooks/use-organizations";
import { useOrganizationStore } from "@/stores/organization.store";

export function OrganizationSelector() {
    const {
        data: organizations = [],
        isLoading,
        isError,
    } = useOrganizations();

    const {
        selectedOrganizationId,
        setSelectedOrganizationId,
    } = useOrganizationStore();

    useEffect(() => {
        if (!selectedOrganizationId && organizations.length > 0) {
            setSelectedOrganizationId(organizations[0].id);
        }
    }, [selectedOrganizationId, organizations, setSelectedOrganizationId]);

    if (isLoading) {
        return (
            <div className="h-9 w-36 animate-pulse rounded-lg bg-[rgb(var(--secondary))]" />
        );
    }

    if (isError || organizations.length === 0) {
        return null;
    }

    return (
        <div className="relative">
            <select
                value={selectedOrganizationId ?? organizations[0]?.id ?? ""}
                onChange={(e) => setSelectedOrganizationId(e.target.value)}
                className="
                    h-9
                    min-w-36
                    appearance-none
                    rounded-lg
                    border
                    border-[rgb(var(--border))]
                    bg-[rgb(var(--card))]
                    pl-3
                    pr-7
                    text-xs
                    font-semibold
                    text-[rgb(var(--foreground))]
                    outline-none
                    transition
                    hover:bg-[rgb(var(--secondary))]
                    focus:border-[rgb(var(--ring))]
                "
            >
                {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                        ORG: {org.name}
                    </option>
                ))}
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[rgb(var(--muted-foreground))]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </div>
        </div>
    );
}
