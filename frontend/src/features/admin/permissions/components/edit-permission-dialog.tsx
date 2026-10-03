"use client";

import { useState, useEffect } from "react";
import { Permission } from "../types/permission.types";
import { updatePermission } from "../api/permission.api";
import { useToast } from "@/components/feedback/toast-system";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, KeyRound, Loader2, Edit } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface EditPermissionDialogProps {
  permission: Permission | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPermissionDialog({
  permission,
  open,
  onOpenChange,
}: EditPermissionDialogProps) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [resource, setResource] = useState("");
  const [action, setAction] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (permission) {
      setName(permission.name || "");
      setDescription(permission.description || "");
      setResource(permission.resource || "");
      setAction(permission.action || "");
    }
  }, [permission]);

  if (!open || !permission) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updatePermission(permission.id, {
        name,
        description,
        resource,
        action,
      });
      toast.success("Permission updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-permissions"] });
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update permission";
      toast.error(msg, "Update Error");
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 font-bold shadow-sm">
              <Edit className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[rgb(var(--foreground))]">
                Edit Permission
              </h3>
              <p className="text-xs text-[rgb(var(--muted-foreground))]">
                Modify permission name and description
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
            <Label htmlFor="edit-perm-name" className="text-xs font-semibold">
              Permission Name
            </Label>
            <Input
              id="edit-perm-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-perm-resource" className="text-xs font-semibold">
                Resource
              </Label>
              <Input
                id="edit-perm-resource"
                type="text"
                value={resource}
                onChange={(e) => setResource(e.target.value)}
                className="text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-perm-action" className="text-xs font-semibold">
                Action
              </Label>
              <Input
                id="edit-perm-action"
                type="text"
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-perm-desc" className="text-xs font-semibold">
              Description
            </Label>
            <Input
              id="edit-perm-desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this permission unlocks..."
              className="text-xs"
            />
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
              disabled={isSubmitting}
              className="gap-1.5 bg-gradient-to-r from-[rgb(var(--primary))] to-indigo-600"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
