"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateEnvironment } from "../hooks/use-environments";
import { useToast } from "@/components/feedback/toast-system";

const createEnvSchema = z.object({
  name: z.string().min(2, "Environment name must be at least 2 characters"),
  description: z.string().optional(),
});

type CreateEnvFormValues = z.infer<typeof createEnvSchema>;

interface CreateEnvironmentDialogProps {
  workspaceId: string;
}

export function CreateEnvironmentDialog({ workspaceId }: CreateEnvironmentDialogProps) {
  const [open, setOpen] = useState(false);
  const createEnv = useCreateEnvironment(workspaceId);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateEnvFormValues>({
    resolver: zodResolver(createEnvSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = (data: CreateEnvFormValues) => {
    createEnv.mutate(data, {
      onSuccess: () => {
        toast.success("Environment created successfully");
        reset();
        setOpen(false);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Failed to create environment");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" className="gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" />
            New Environment
          </Button>
        }
      />

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Environment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-3">
          <div className="space-y-2">
            <Label htmlFor="env-name">Environment Name</Label>
            <Input id="env-name" placeholder="Production, Staging, Local..." {...register("name")} />
            {errors.name && (
              <p className="text-xs text-[rgb(var(--danger))]">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="env-desc">Description</Label>
            <Textarea
              id="env-desc"
              placeholder="Variables and endpoints for production deployment..."
              {...register("description")}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createEnv.isPending}>
              {createEnv.isPending ? "Creating..." : "Create Environment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
