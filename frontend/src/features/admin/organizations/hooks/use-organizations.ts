"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { getOrganizations } from "../api/organization.api";

export function useOrganizations() {
    return useQuery({
        queryKey: queryKeys.organizations.all,
        queryFn: getOrganizations,
    });
}