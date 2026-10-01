"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import {
  getCollections,
  getCollection,
  createCollection,
  updateCollection,
  deleteCollection,
} from "../api/collection.api";
import type { CreateCollectionRequest, UpdateCollectionRequest } from "../types/collection.types";

export function useCollections(workspaceId: string | null) {
  return useQuery({
    queryKey: queryKeys.collections.all(workspaceId ?? ""),
    queryFn: () => getCollections(workspaceId!),
    enabled: Boolean(workspaceId),
  });
}

export function useCollection(collectionId: string) {
  return useQuery({
    queryKey: queryKeys.collections.detail(collectionId),
    queryFn: () => getCollection(collectionId),
    enabled: Boolean(collectionId),
  });
}

export function useCreateCollection(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateCollectionRequest) => createCollection(workspaceId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.collections.all(workspaceId) });
    },
  });
}

export function useUpdateCollection(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ collectionId, request }: { collectionId: string; request: UpdateCollectionRequest }) =>
      updateCollection(collectionId, request),
    onSuccess: (_, { collectionId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.collections.detail(collectionId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.collections.all(workspaceId) });
    },
  });
}

export function useDeleteCollection(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (collectionId: string) => deleteCollection(collectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.collections.all(workspaceId) });
    },
  });
}
