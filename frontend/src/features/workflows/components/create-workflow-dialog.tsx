"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GitFork } from "lucide-react";

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
import { useCreateWorkflow } from "../hooks/use-workflows";
import { useToast } from "@/components/feedback/toast-system";

const createWorkflowSchema = z.object({
  name: z.string().min(2, "Workflow name must be at least 2 characters"),
  description: z.string().optional(),
});

type CreateWorkflowFormValues = z.infer<typeof createWorkflowSchema>;

interface CreateWorkflowDialogProps {
  workspaceId: string;
}

export function CreateWorkflowDialog({ workspaceId }: CreateWorkflowDialogProps) {
  const [open, setOpen] = useState(false);
  const createWf = useCreateWorkflow(workspaceId);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateWorkflowFormValues>({
    resolver: zodResolver(createWorkflowSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = (data: CreateWorkflowFormValues) => {
    createWf.mutate(data, {
      onSuccess: () => {
        toast.success("Workflow created successfully");
        reset();
        setOpen(false);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Failed to create workflow");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" className="gap-1.5 text-xs">
            <GitFork className="h-3.5 w-3.5" />
            New Workflow
          </Button>
        }
      />

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Multi-step Workflow</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-3">
          <div className="space-y-2">
            <Label htmlFor="wf-name">Workflow Name</Label>
            <Input
              id="wf-name"
              placeholder="Authentication & User Provisioning Pipeline"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-[rgb(var(--danger))]">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="wf-desc">Description</Label>
            <Textarea
              id="wf-desc"
              placeholder="Chains login request to obtain token, then fetches profile data..."
              {...register("description")}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createWf.isPending}>
              {createWf.isPending ? "Creating..." : "Create Workflow"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
