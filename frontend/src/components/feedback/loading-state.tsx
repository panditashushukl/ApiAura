import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingState({
  message = "Loading...",
  description,
  size = "md",
  className = "",
}: LoadingStateProps) {
  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center text-[rgb(var(--foreground))] ${className}`}
    >
      <Loader2
        className={`${iconSizes[size]} animate-spin text-[rgb(var(--primary))] mb-3`}
      />
      {message && (
        <h3 className="text-sm font-medium text-[rgb(var(--foreground))]">
          {message}
        </h3>
      )}
      {description && (
        <p className="mt-1 text-xs text-[rgb(var(--muted-foreground))]">
          {description}
        </p>
      )}
    </div>
  );
}
