"use client";

import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { updateWorkspace } from "../api/workspace.api";

import type {
    UpdateWorkspaceRequest,
} from "../types/workspace.types";

export function useUpdateWorkspace() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: ({
            workspaceId,
            request,
        }: {
            workspaceId: string;
            request: UpdateWorkspaceRequest;
        }) =>
            updateWorkspace(
                workspaceId,
                request
            ),

        onSuccess: (workspace) => {
            queryClient.setQueryData(
                ["workspace", workspace.id],
                workspace
            );

            queryClient.invalidateQueries({
                queryKey: ["workspaces"],
            });
        },
    });
}