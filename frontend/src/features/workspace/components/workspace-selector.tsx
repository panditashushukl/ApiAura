"use client";

import { useEffect } from "react";

import { useWorkspaces } from "../hooks/use-workspaces";
import { useWorkspaceStore } from "@/stores/workspace.store";

export function WorkspaceSelector() {
    const {
        data: workspaces = [],
        isLoading,
        isError,
    } = useWorkspaces();

    const {
        selectedWorkspaceId,
        setSelectedWorkspace,
    } = useWorkspaceStore();

    /*
     * Automatically select the first workspace
     * when no workspace has been selected yet.
     */
    useEffect(() => {
        if (
            !selectedWorkspaceId &&
            workspaces.length > 0
        ) {
            setSelectedWorkspace(
                workspaces[0].id
            );
        }
    }, [
        selectedWorkspaceId,
        workspaces,
        setSelectedWorkspace,
    ]);

    if (isLoading) {
        return (
            <div className="h-10 w-56 animate-pulse rounded-lg bg-[rgb(var(--secondary))]" />
        );
    }

    if (isError) {
        return (
            <div className="rounded-lg border border-[rgb(var(--danger))]/30 px-3 py-2 text-sm text-[rgb(var(--danger))]">
                Failed to load workspaces
            </div>
        );
    }

    if (workspaces.length === 0) {
        return (
            <div className="rounded-lg border border-[rgb(var(--border))] px-3 py-2 text-sm text-[rgb(var(--muted-foreground))]">
                No workspaces
            </div>
        );
    }

    return (
        <div className="relative">
            <select
                value={
                    selectedWorkspaceId ??
                    workspaces[0].id
                }
                onChange={(event) =>
                    setSelectedWorkspace(
                        event.target.value
                    )
                }
                className="
                    h-10
                    min-w-56
                    appearance-none
                    rounded-lg
                    border
                    border-[rgb(var(--border))]
                    bg-[rgb(var(--card))]
                    px-3
                    pr-9
                    text-sm
                    font-medium
                    text-[rgb(var(--foreground))]
                    outline-none
                    transition
                    hover:bg-[rgb(var(--secondary))]
                    focus:border-[rgb(var(--ring))]
                    focus:ring-2
                    focus:ring-[rgb(var(--ring))]/20
                "
            >
                {workspaces.map(
                    (workspace) => (
                        <option
                            key={workspace.id}
                            value={workspace.id}
                        >
                            {workspace.name}
                        </option>
                    )
                )}
            </select>

            <div
                className="
                    pointer-events-none
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-[rgb(var(--muted-foreground))]
                "
            >
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </div>
        </div>
    );
}