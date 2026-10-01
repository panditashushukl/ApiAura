"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastContextValue {
  toast: (item: Omit<ToastItem, "id">) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (item: Omit<ToastItem, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastItem = { ...item, id };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const value: ToastContextValue = {
    toast: addToast,
    success: (message, title) => addToast({ type: "success", message, title }),
    error: (message, title) => addToast({ type: "error", message, title }),
    info: (message, title) => addToast({ type: "info", message, title }),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-lg transition-all animate-in slide-in-from-bottom-2 ${
              t.type === "success"
                ? "bg-[rgb(var(--card))] border-[rgb(var(--success))/0.4] text-[rgb(var(--foreground))]"
                : t.type === "error"
                ? "bg-[rgb(var(--card))] border-[rgb(var(--danger))/0.4] text-[rgb(var(--foreground))]"
                : "bg-[rgb(var(--card))] border-[rgb(var(--border))] text-[rgb(var(--foreground))]"
            }`}
          >
            {t.type === "success" && (
              <CheckCircle2 className="w-4 h-4 text-[rgb(var(--success))] shrink-0 mt-0.5" />
            )}
            {t.type === "error" && (
              <AlertCircle className="w-4 h-4 text-[rgb(var(--danger))] shrink-0 mt-0.5" />
            )}
            {t.type === "info" && (
              <Info className="w-4 h-4 text-[rgb(var(--info))] shrink-0 mt-0.5" />
            )}

            <div className="flex-1 min-w-0">
              {t.title && (
                <p className="text-xs font-semibold text-[rgb(var(--foreground))] mb-0.5">
                  {t.title}
                </p>
              )}
              <p className="text-xs text-[rgb(var(--muted-foreground))] leading-snug">
                {t.message}
              </p>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
