"use client";

import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { deleteWorkspace } from "../api/workspace.api";

export function useDeleteWorkspace() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: (
            workspaceId: string
        ) =>
            deleteWorkspace(workspaceId),

        onSuccess: (_, workspaceId) => {
            queryClient.invalidateQueries({
                queryKey: ["workspaces"],
            });

            queryClient.removeQueries({
                queryKey: [
                    "workspace",
                    workspaceId,
                ],
            });
        },
    });
}