"use client";

import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { deleteOrganization } from "../api/organization.api";

export function useDeleteOrganization() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: (
            organizationId: string
        ) =>
            deleteOrganization(
                organizationId
            ),

        onSuccess: (_, organizationId) => {
            queryClient.removeQueries({
                queryKey: queryKeys.organizations.detail(organizationId),
            });

            queryClient.invalidateQueries({
                queryKey: queryKeys.organizations.all,
            });
        },
    });
}