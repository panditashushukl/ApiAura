"use client";

import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { createOrganization } from "../api/organization.api";

import type {
    CreateOrganizationRequest,
} from "../types/organization.types";

export function useCreateOrganization() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: (
            request: CreateOrganizationRequest
        ) => createOrganization(request),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.organizations.all,
            });
        },
    });
}