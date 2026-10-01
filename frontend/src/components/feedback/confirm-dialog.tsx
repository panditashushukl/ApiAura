"use client";

import React, { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "primary";
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
  onConfirm,
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  const buttonVariantMap = {
    danger: "danger" as const,
    warning: "primary" as const,
    primary: "primary" as const,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[rgb(var(--border))] bg-[rgb(var(--card))] text-[rgb(var(--card-foreground))] sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            {variant === "danger" && (
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[rgb(var(--danger))/0.15] text-[rgb(var(--danger))]">
                <AlertTriangle className="w-5 h-5" />
              </div>
            )}
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-[rgb(var(--muted-foreground))] leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter showCloseButton={false} className="gap-2 sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isLoading}
            onClick={() => onOpenChange(false)}
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            variant={buttonVariantMap[variant]}
            size="sm"
            disabled={isLoading}
            onClick={handleConfirm}
          >
            {isLoading ? "Processing..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
