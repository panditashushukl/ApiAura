"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateEnvironment } from "../hooks/use-environments";
import { useToast } from "@/components/feedback/toast-system";
import type { Environment } from "../types/environment.types";

const editEnvSchema = z.object({
  name: z.string().min(2, "Environment name must be at least 2 characters"),
  description: z.string().optional(),
});

type EditEnvFormValues = z.infer<typeof editEnvSchema>;

interface EditEnvironmentDialogProps {
  workspaceId: string;
  environment: Environment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditEnvironmentDialog({
  workspaceId,
  environment,
  open,
  onOpenChange,
}: EditEnvironmentDialogProps) {
  const updateEnv = useUpdateEnvironment(workspaceId);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditEnvFormValues>({
    resolver: zodResolver(editEnvSchema),
  });

  useEffect(() => {
    if (environment) {
      reset({
        name: environment.name,
        description: environment.description || "",
      });
    }
  }, [environment, reset]);

  const onSubmit = (data: EditEnvFormValues) => {
    if (!environment) return;

    updateEnv.mutate(
      { environmentId: environment.id, request: data },
      {
        onSuccess: () => {
          toast.success("Environment updated successfully");
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Failed to update environment");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Environment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-3">
          <div className="space-y-2">
            <Label htmlFor="edit-env-name">Environment Name</Label>
            <Input id="edit-env-name" {...register("name")} />
            {errors.name && (
              <p className="text-xs text-[rgb(var(--danger))]">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-env-desc">Description</Label>
            <Textarea id="edit-env-desc" {...register("description")} />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateEnv.isPending}>
              {updateEnv.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
