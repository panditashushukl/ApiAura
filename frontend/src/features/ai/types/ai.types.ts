export type AiMessageRole = "USER" | "ASSISTANT" | "SYSTEM" | "TOOL";

export type AiActionRisk = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type AiActionStatus =
  | "PENDING"
  | "CONFIRMED"
  | "REJECTED"
  | "EXECUTED"
  | "FAILED";

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: AiMessageRole;
  content: string;
  createdAt: string;
}

export interface AiAction {
  id: string;
  sessionId: string;
  toolName: string;
  risk: AiActionRisk;
  status: AiActionStatus;
  inputJson?: string | null;
  outputJson?: string | null;
  errorMessage?: string | null;
  confirmationRequired: boolean;
  confirmed: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ChatSession {
  id: string;
  workspaceId: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  actions: AiAction[];
}

export interface CreateChatSessionRequest {
  title?: string;
}

export interface SendMessageRequest {
  content: string;
}
