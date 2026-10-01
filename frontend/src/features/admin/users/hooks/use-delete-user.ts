"use client";

import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { deleteUser } from "../api/user.api";

export function useDeleteUser() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: (
            userId: string
        ) => deleteUser(userId),

        onSuccess: (_, userId) => {
            queryClient.removeQueries({
                queryKey: queryKeys.users.detail(userId),
            });

            queryClient.invalidateQueries({
                queryKey: queryKeys.users.all,
            });
        },
    });
}