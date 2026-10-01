"use client";

import { useState } from "react";
import {
  Sparkles,
  Send,
  Bot,
  User,
  Plus,
  Wrench,
  Zap,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  useChatSession,
  useCreateChatSession,
  useSendMessage,
} from "../hooks/use-ai";
import { AiToolCard } from "./ai-tool-card";
import { useToast } from "@/components/feedback/toast-system";

interface AiChatInterfaceProps {
  workspaceId: string;
}

export function AiChatInterface({ workspaceId }: AiChatInterfaceProps) {
  const toast = useToast();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [inputPrompt, setInputPrompt] = useState("");

  const createSession = useCreateChatSession(workspaceId);
  const { data: session } = useChatSession(activeSessionId);
  const sendMsg = useSendMessage(activeSessionId || "");

  const messages = session?.messages || [];
  const actions = session?.actions || [];

  const handleCreateNewSession = () => {
    createSession.mutate(
      { title: `AI Session - ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` },
      {
        onSuccess: (newSes) => {
          setActiveSessionId(newSes.id);
          toast.success("New AI session created");
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Failed to create session");
        },
      }
    );
  };

  const handleSend = (promptToSend?: string) => {
    const text = promptToSend || inputPrompt;
    if (!text.trim()) return;

    if (!activeSessionId) {
      // Auto create session then send
      createSession.mutate(
        { title: text.slice(0, 30) + "..." },
        {
          onSuccess: (newSes) => {
            setActiveSessionId(newSes.id);
            setInputPrompt("");
            sendMsg.mutate({ content: text });
          },
        }
      );
      return;
    }

    setInputPrompt("");
    sendMsg.mutate(
      { content: text },
      {
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Failed to send message");
        },
      }
    );
  };

  const quickPrompts = [
    "Create a POST request for User Authentication with JSON body",
    "Generate integration test assertions for status 200 and response time < 500ms",
    "Extract JWT token from response and save to environment variable",
    "Build a multi-step workflow for user registration and profile lookup",
  ];

  return (
    <div className="flex flex-col h-[82vh] max-w-5xl mx-auto border border-[rgb(var(--border))] rounded-xl bg-[rgb(var(--card))] overflow-hidden shadow-sm">
      {/* Top Header Bar */}
      <div className="p-4 border-b border-[rgb(var(--border))] bg-[rgb(var(--muted))/30] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-[rgb(var(--primary))]/10 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-[rgb(var(--primary))]" />
          </div>
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2">
              ApiAura AI Agent
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-500 font-normal">
                Tool Calling Active
              </span>
            </h2>
            <p className="text-[11px] text-[rgb(var(--muted-foreground))]">
              AI-native assistant to generate requests, execute API tests, and automate workflows.
            </p>
          </div>
        </div>

        <Button
          size="sm"
          onClick={handleCreateNewSession}
          disabled={createSession.isPending}
          className="gap-1.5 text-xs h-8"
        >
          <Plus className="h-3.5 w-3.5" />
          New Session
        </Button>
      </div>

      {/* Message Stream Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
        {messages.length === 0 ? (
          <div className="p-8 text-center space-y-4 my-auto">
            <Bot className="h-12 w-12 mx-auto text-[rgb(var(--primary))] opacity-70" />
            <div>
              <h3 className="text-base font-semibold">How can ApiAura AI help you today?</h3>
              <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1 max-w-md mx-auto">
                Ask the AI agent to build requests, write test assertions, set up environment variables, or execute multi-step workflows.
              </p>
            </div>

            {/* Quick Prompt Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl mx-auto pt-2">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(qp)}
                  className="p-3 text-left rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] hover:border-[rgb(var(--primary))] hover:text-[rgb(var(--primary))] transition-colors text-xs font-medium"
                >
                  <Zap className="h-3.5 w-3.5 inline mr-1.5 text-amber-500" />
                  {qp}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === "USER";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="h-7 w-7 rounded-md bg-[rgb(var(--primary))]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-4 w-4 text-[rgb(var(--primary))]" />
                  </div>
                )}

                <div
                  className={`max-w-xl rounded-xl p-3.5 space-y-2 ${
                    isUser
                      ? "bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))]"
                      : "bg-[rgb(var(--muted))/40] border border-[rgb(var(--border))]"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>

                {isUser && (
                  <div className="h-7 w-7 rounded-md bg-[rgb(var(--muted))] flex items-center justify-center shrink-0 mt-0.5">
                    <User className="h-4 w-4 text-[rgb(var(--muted-foreground))]" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Render tool action cards if actions exist for this session */}
        {actions.length > 0 && activeSessionId && (
          <div className="space-y-2 pt-2">
            <h4 className="text-[11px] font-semibold text-[rgb(var(--muted-foreground))] flex items-center gap-1.5">
              <Wrench className="h-3.5 w-3.5" /> AI Tool Execution Trail
            </h4>
            {actions.map((act) => (
              <AiToolCard key={act.id} action={act} sessionId={activeSessionId} />
            ))}
          </div>
        )}

        {/* Typing indicator */}
        {sendMsg.isPending && (
          <div className="flex items-center gap-2 text-xs text-[rgb(var(--muted-foreground))] p-2">
            <Loader2 className="h-4 w-4 animate-spin text-[rgb(var(--primary))]" />
            <span>AI Assistant is thinking & analyzing tools...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-[rgb(var(--border))] bg-[rgb(var(--card))]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <Textarea
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask AI to create API requests, generate test suites, or execute workflows..."
            className="min-h-[44px] h-[44px] text-xs resize-none py-3"
          />
          <Button
            type="submit"
            disabled={sendMsg.isPending || !inputPrompt.trim()}
            className="h-[44px] px-4 gap-1.5 shrink-0"
          >
            <Send className="h-4 w-4" />
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
