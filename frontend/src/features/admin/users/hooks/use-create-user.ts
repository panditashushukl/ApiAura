"use client";

import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { createUser } from "../api/user.api";

import type { CreateUserRequest } from "../types/user.types";

export function useCreateUser() {
    const queryClient =
        useQueryClient();

    return useMutation({
        mutationFn: (
            request: CreateUserRequest
        ) => createUser(request),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.users.all,
            });
        },
    });
}