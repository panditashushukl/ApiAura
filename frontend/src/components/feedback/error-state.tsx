import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  status?: number;
  validationErrors?: Record<string, string>;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Failed to load data",
  message = "An unexpected error occurred while communicating with the server.",
  status,
  validationErrors,
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-6 border border-[rgb(var(--danger))/0.3] rounded-xl bg-[rgb(var(--danger))/0.05] text-center ${className}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgb(var(--danger))/0.15] text-[rgb(var(--danger))] mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>

      <div className="flex items-center gap-2 mb-1">
        <h3 className="text-sm font-semibold text-[rgb(var(--foreground))]">
          {title}
        </h3>
        {status && (
          <span className="rounded bg-[rgb(var(--danger))/0.2] px-1.5 py-0.5 text-xs font-mono text-[rgb(var(--danger))]">
            HTTP {status}
          </span>
        )}
      </div>

      <p className="max-w-md text-xs text-[rgb(var(--muted-foreground))] mb-4 leading-relaxed">
        {message}
      </p>

      {validationErrors && Object.keys(validationErrors).length > 0 && (
        <div className="mb-4 w-full max-w-md rounded-lg border border-[rgb(var(--danger))/0.2] bg-[rgb(var(--card))] p-3 text-left">
          <p className="text-xs font-medium text-[rgb(var(--danger))] mb-2">
            Validation Errors:
          </p>
          <ul className="space-y-1 text-xs text-[rgb(var(--muted-foreground))] font-mono">
            {Object.entries(validationErrors).map(([field, err]) => (
              <li key={field} className="flex justify-between gap-2">
                <span className="font-semibold text-[rgb(var(--foreground))]">{field}:</span>
                <span className="text-[rgb(var(--danger))]">{err}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {onRetry && (
        <Button onClick={onRetry} variant="secondary" size="sm">
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Try Again
        </Button>
      )}
    </div>
  );
}
