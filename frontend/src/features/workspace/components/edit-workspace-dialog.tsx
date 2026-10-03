"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateWorkspace } from "../hooks/use-update-workspace";
import { Workspace } from "../types/workspace.types";
import { useToast } from "@/components/feedback/toast-system";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

const updateWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Workspace name must be at least 2 characters")
    .max(150, "Workspace name cannot exceed 150 characters"),
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug cannot exceed 100 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug can contain lowercase letters, numbers and hyphens"
    ),
  description: z.string().trim().max(1000, "Description cannot exceed 1000 characters").optional(),
});

type UpdateWorkspaceFormData = z.infer<typeof updateWorkspaceSchema>;

interface EditWorkspaceDialogProps {
  workspace: Workspace | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditWorkspaceDialog({
  workspace,
  open,
  onOpenChange,
}: EditWorkspaceDialogProps) {
  const updateWorkspaceMutation = useUpdateWorkspace();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateWorkspaceFormData>({
    resolver: zodResolver(updateWorkspaceSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
    },
  });

  useEffect(() => {
    if (workspace) {
      reset({
        name: workspace.name || "",
        slug: workspace.slug || "",
        description: workspace.description || "",
      });
    }
  }, [workspace, reset]);

  const onSubmit = (data: UpdateWorkspaceFormData) => {
    if (!workspace) return;
    updateWorkspaceMutation.mutate(
      {
        workspaceId: workspace.id,
        request: {
          name: data.name,
          slug: data.slug,
          description: data.description || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("Workspace updated successfully");
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Failed to update workspace");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[rgb(var(--border))]/60 bg-[rgb(var(--card))]/90 backdrop-blur-2xl text-[rgb(var(--foreground))] sm:max-w-lg glass-dropdown">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">Edit Workspace</DialogTitle>
          <DialogDescription className="text-xs text-[rgb(var(--muted-foreground))]">
            Update workspace details, name, identifier slug, and description.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          {/* Workspace Name */}
          <div className="space-y-1.5">
            <label htmlFor="edit-ws-name" className="text-xs font-semibold">
              Workspace Name
            </label>
            <Input
              id="edit-ws-name"
              placeholder="My API Workspace"
              {...register("name")}
              error={Boolean(errors.name)}
              className="text-xs"
            />
            {errors.name && (
              <p className="text-xs font-medium text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <label htmlFor="edit-ws-slug" className="text-xs font-semibold">
              Workspace Slug
            </label>
            <Input
              id="edit-ws-slug"
              placeholder="my-api-workspace"
              {...register("slug")}
              error={Boolean(errors.slug)}
              className="text-xs font-mono"
            />
            {errors.slug && (
              <p className="text-xs font-medium text-red-500">{errors.slug.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="edit-ws-description" className="text-xs font-semibold">
              Description
            </label>
            <textarea
              id="edit-ws-description"
              placeholder="Describe what this workspace is used for..."
              rows={3}
              {...register("description")}
              className="w-full resize-none rounded-xl border border-[rgb(var(--input))] bg-[rgb(var(--background))]/60 px-3 py-2 text-xs text-[rgb(var(--foreground))] outline-none focus:ring-2 focus:ring-[rgb(var(--ring))]/30 transition"
            />
            {errors.description && (
              <p className="text-xs font-medium text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-[rgb(var(--border))]/50">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={updateWorkspaceMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={updateWorkspaceMutation.isPending}
              className="gap-1.5"
            >
              {updateWorkspaceMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
