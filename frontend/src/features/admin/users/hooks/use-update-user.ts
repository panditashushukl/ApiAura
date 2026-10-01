"use client";

import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { updateUser } from "../api/user.api";

import type { UpdateUserRequest } from "../types/user.types";

export function useUpdateUser() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: ({
            userId,
            request,
        }: {
            userId: string;
            request: UpdateUserRequest;
        }) =>
            updateUser(
                userId,
                request
            ),

        onSuccess: (user) => {
            queryClient.setQueryData(
                queryKeys.users.detail(user.id),
                user
            );

            queryClient.invalidateQueries({
                queryKey: queryKeys.users.all,
            });
        },
    });
}