import { apiClient } from "@/lib/api/client";
import type {
  AiAction,
  ChatMessage,
  ChatSession,
  CreateChatSessionRequest,
  SendMessageRequest,
} from "../types/ai.types";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export async function createChatSession(
  workspaceId: string,
  request?: CreateChatSessionRequest
): Promise<ChatSession> {
  const response = await apiClient<ApiResponse<ChatSession>>(
    `/ai/workspaces/${workspaceId}/sessions`,
    {
      method: "POST",
      data: JSON.stringify(request || { title: "New AI Session" }),
    }
  );
  return response.data;
}

export async function getChatSession(sessionId: string): Promise<ChatSession> {
  const response = await apiClient<ApiResponse<ChatSession>>(
    `/ai/sessions/${sessionId}`
  );
  return response.data;
}

export async function sendMessage(
  sessionId: string,
  request: SendMessageRequest
): Promise<ChatMessage> {
  const response = await apiClient<ApiResponse<ChatMessage>>(
    `/ai/sessions/${sessionId}/messages`,
    {
      method: "POST",
      data: JSON.stringify(request),
    }
  );
  return response.data;
}

export async function getSessionActions(sessionId: string): Promise<AiAction[]> {
  const response = await apiClient<ApiResponse<AiAction[]>>(
    `/ai/sessions/${sessionId}/actions`
  );
  return response.data || [];
}

export async function confirmAction(actionId: string): Promise<AiAction> {
  const response = await apiClient<ApiResponse<AiAction>>(
    `/ai/actions/${actionId}/confirm`,
    { method: "POST" }
  );
  return response.data;
}

export async function rejectAction(actionId: string): Promise<AiAction> {
  const response = await apiClient<ApiResponse<AiAction>>(
    `/ai/actions/${actionId}/reject`,
    { method: "POST" }
  );
  return response.data;
}
