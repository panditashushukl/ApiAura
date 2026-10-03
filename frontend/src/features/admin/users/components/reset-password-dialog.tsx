"use client";

import { useState } from "react";
import { User } from "../types/user.types";
import { adminResetPassword } from "../api/user.api";
import { useToast } from "@/components/feedback/toast-system";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, KeyRound, Loader2, Lock } from "lucide-react";

interface ResetPasswordDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResetPasswordDialog({
  user,
  open,
  onOpenChange,
}: ResetPasswordDialogProps) {
  const toast = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);
    try {
      await adminResetPassword(user.id, { newPassword });
      toast.success(
        `Password for ${user.name || user.email} updated successfully.`
      );
      setNewPassword("");
      onOpenChange(false);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to reset user password";
      toast.error(msg, "Reset Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-[rgb(var(--border))]/50 bg-[rgb(var(--card))]/90 backdrop-blur-xl p-6 shadow-2xl glass-dropdown">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[rgb(var(--border))]/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 font-bold shadow-sm">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[rgb(var(--foreground))]">
                Reset User Password
              </h3>
              <p className="text-xs text-[rgb(var(--muted-foreground))]">
                Set a new password for {user.name || user.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg p-1.5 text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--secondary))] hover:text-[rgb(var(--foreground))] transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="admin-new-pass" className="text-xs font-semibold">
              New Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-[rgb(var(--muted-foreground))]" />
              <Input
                id="admin-new-pass"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                minLength={6}
                required
                className="pl-9 text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[rgb(var(--border))]/50">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !newPassword}
              className="gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Update Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
