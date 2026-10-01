"use client";

import { useQuery } from "@tanstack/react-query";

import { getWorkspace } from "../api/workspace.api";

export function useWorkspace(
    workspaceId: string
) {
    return useQuery({
        queryKey: ["workspace", workspaceId],
        queryFn: () =>
            getWorkspace(workspaceId),
        enabled: Boolean(workspaceId),
    });
}