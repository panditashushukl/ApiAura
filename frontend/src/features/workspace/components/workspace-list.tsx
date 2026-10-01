"use client";

import { useWorkspaces } from "../hooks/use-workspaces";

export function WorkspaceList() {
    const {
        data: workspaces,
        isLoading,
        isError,
        error,
    } = useWorkspaces();

    if (isLoading) {
        return (
            <div className="p-6">
                Loading workspaces...
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-6 text-red-500">
                Failed to load workspaces.

                <p className="mt-2 text-sm">
                    {error instanceof Error
                        ? error.message
                        : "Unknown error"}
                </p>
            </div>
        );
    }

    if (!workspaces?.length) {
        return (
            <div className="p-6">
                No workspaces found.
            </div>
        );
    }

    return (
        <div className="space-y-4 p-6">
            <h1 className="text-2xl font-semibold">
                Workspaces
            </h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {workspaces.map((workspace) => (
                    <div
                        key={workspace.id}
                        className="rounded-lg border p-4"
                    >
                        <h2 className="font-medium">
                            {workspace.name}
                        </h2>

                        {workspace.description && (
                            <p className="mt-2 text-sm text-muted-foreground">
                                {workspace.description}
                            </p>
                        )}

                        <p className="mt-3 text-xs">
                            Status: {workspace.status}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}