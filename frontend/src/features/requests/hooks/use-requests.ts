"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import {
  getRequestsByCollection,
  getRequest,
  createRequest,
  updateRequest,
  deleteRequest,
  getRequestHeaders,
  createRequestHeader,
  deleteRequestHeader,
  getQueryParameters,
  createQueryParameter,
  deleteQueryParameter,
} from "../api/request.api";
import type {
  CreateApiRequest,
  CreateQueryParameterRequest,
  CreateRequestHeaderRequest,
  UpdateApiRequest,
} from "../types/request.types";

export function useCollectionRequests(collectionId: string | null) {
  return useQuery({
    queryKey: queryKeys.requests.byCollection(collectionId ?? ""),
    queryFn: () => getRequestsByCollection(collectionId!),
    enabled: Boolean(collectionId),
  });
}

export function useRequestDetail(requestId: string | null) {
  return useQuery({
    queryKey: queryKeys.requests.detail(requestId ?? ""),
    queryFn: () => getRequest(requestId!),
    enabled: Boolean(requestId),
  });
}

export function useCreateRequest(collectionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateApiRequest) => createRequest(collectionId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.byCollection(collectionId) });
    },
  });
}

export function useUpdateRequest(collectionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, request }: { requestId: string; request: UpdateApiRequest }) =>
      updateRequest(requestId, request),
    onSuccess: (_, { requestId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.detail(requestId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.byCollection(collectionId) });
    },
  });
}

export function useDeleteRequest(collectionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => deleteRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.byCollection(collectionId) });
    },
  });
}

// Request Headers hooks
export function useRequestHeaders(requestId: string | null) {
  return useQuery({
    queryKey: queryKeys.requests.headers(requestId ?? ""),
    queryFn: () => getRequestHeaders(requestId!),
    enabled: Boolean(requestId),
  });
}

export function useCreateRequestHeader(requestId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (header: CreateRequestHeaderRequest) => createRequestHeader(requestId, header),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.headers(requestId) });
    },
  });
}

export function useDeleteRequestHeader(requestId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (headerId: string) => deleteRequestHeader(requestId, headerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.headers(requestId) });
    },
  });
}

// Query Parameters hooks
export function useQueryParameters(requestId: string | null) {
  return useQuery({
    queryKey: queryKeys.requests.queryParams(requestId ?? ""),
    queryFn: () => getQueryParameters(requestId!),
    enabled: Boolean(requestId),
  });
}

export function useCreateQueryParameter(requestId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (param: CreateQueryParameterRequest) => createQueryParameter(requestId, param),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.queryParams(requestId) });
    },
  });
}

export function useDeleteQueryParameter(requestId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (parameterId: string) => deleteQueryParameter(requestId, parameterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.queryParams(requestId) });
    },
  });
}
