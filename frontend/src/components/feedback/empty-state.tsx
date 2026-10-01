import React, { ReactNode } from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionNode?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon = <FolderOpen className="w-10 h-10 text-[rgb(var(--muted-foreground))]" />,
  title,
  description,
  actionLabel,
  onAction,
  actionNode,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 border border-dashed border-[rgb(var(--border))] rounded-xl bg-[rgb(var(--card))/0.5] text-center ${className}`}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[rgb(var(--secondary))] mb-4">
        {icon}
      </div>

      <h3 className="text-base font-semibold text-[rgb(var(--foreground))] mb-1">
        {title}
      </h3>

      {description && (
        <p className="max-w-md text-xs text-[rgb(var(--muted-foreground))] mb-5 leading-relaxed">
          {description}
        </p>
      )}

      {actionNode ? (
        actionNode
      ) : actionLabel && onAction ? (
        <Button onClick={onAction} variant="primary" size="sm">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
