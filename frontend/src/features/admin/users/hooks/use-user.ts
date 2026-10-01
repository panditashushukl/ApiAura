"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { getUser } from "../api/user.api";

export function useUser(userId: string) {
    return useQuery({
        queryKey: queryKeys.users.detail(userId),
        queryFn: () => getUser(userId),
        enabled: Boolean(userId),
    });
}