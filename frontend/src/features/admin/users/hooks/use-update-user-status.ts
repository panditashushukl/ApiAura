"use client";

import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { updateUserStatus } from "../api/user.api";

import type {
    UpdateUserStatusRequest,
} from "../types/user.types";

export function useUpdateUserStatus() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: ({
            userId,
            request,
        }: {
            userId: string;
            request: UpdateUserStatusRequest;
        }) =>
            updateUserStatus(
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