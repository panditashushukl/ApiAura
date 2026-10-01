"use client";

import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { updateOrganization } from "../api/organization.api";

import type {
    Organization,
    UpdateOrganizationRequest,
} from "../types/organization.types";

export function useUpdateOrganization() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: ({
            organizationId,
            request,
        }: {
            organizationId: string;
            request: UpdateOrganizationRequest;
        }) =>
            updateOrganization(
                organizationId,
                request
            ),

        onSuccess: (
            organization: Organization
        ) => {
            queryClient.setQueryData(
                queryKeys.organizations.detail(organization.id),
                organization
            );

            queryClient.invalidateQueries({
                queryKey: queryKeys.organizations.all,
            });
        },
    });
}