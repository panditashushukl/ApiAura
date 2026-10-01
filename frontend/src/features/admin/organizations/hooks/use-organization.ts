"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { getOrganization } from "../api/organization.api";

export function useOrganization(
    organizationId: string
) {
    return useQuery({
        queryKey: queryKeys.organizations.detail(organizationId),
        queryFn: () =>
            getOrganization(
                organizationId
            ),
        enabled: Boolean(
            organizationId
        ),
    });
}