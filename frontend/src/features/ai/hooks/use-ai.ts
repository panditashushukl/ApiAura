"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import {
  createChatSession,
  getChatSession,
  sendMessage,
  getSessionActions,
  confirmAction,
  rejectAction,
} from "../api/ai.api";
import type { CreateChatSessionRequest, SendMessageRequest } from "../types/ai.types";

export function useChatSession(sessionId: string | null) {
  return useQuery({
    queryKey: queryKeys.ai.messages(sessionId ?? ""),
    queryFn: () => getChatSession(sessionId!),
    enabled: Boolean(sessionId),
  });
}

export function useCreateChatSession(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request?: CreateChatSessionRequest) =>
      createChatSession(workspaceId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ai.sessions() });
    },
  });
}

export function useSendMessage(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: SendMessageRequest) => sendMessage(sessionId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.ai.messages(sessionId),
      });
    },
  });
}

export function useSessionActions(sessionId: string | null) {
  return useQuery({
    queryKey: ["ai", "actions", sessionId],
    queryFn: () => getSessionActions(sessionId!),
    enabled: Boolean(sessionId),
  });
}

export function useConfirmAction(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (actionId: string) => confirmAction(actionId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.ai.messages(sessionId),
      });
      queryClient.invalidateQueries({ queryKey: ["ai", "actions", sessionId] });
    },
  });
}

export function useRejectAction(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (actionId: string) => rejectAction(actionId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.ai.messages(sessionId),
      });
      queryClient.invalidateQueries({ queryKey: ["ai", "actions", sessionId] });
    },
  });
}
