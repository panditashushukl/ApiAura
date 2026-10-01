"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { getUsers } from "../api/user.api";

export function useUsers() {
    return useQuery({
        queryKey: queryKeys.users.all,
        queryFn: getUsers,
    });
}