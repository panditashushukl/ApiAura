"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createWorkspace } from "../api/workspace.api";

export function useCreateWorkspace() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: ({
            organizationId,
            name,
            slug,
            description,
        }: {
            organizationId: string;
            name: string;
            slug: string;
            description?: string;
        }) =>
            createWorkspace(
                organizationId,
                {
                    name,
                    slug,
                    description,
                }
            ),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["workspaces"],
            });
        },
    });
}