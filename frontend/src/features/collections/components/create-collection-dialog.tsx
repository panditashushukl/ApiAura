"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FolderPlus } from "lucide-react";

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
import { useCreateCollection } from "../hooks/use-collections";
import { useToast } from "@/components/feedback/toast-system";

const createCollectionSchema = z.object({
  name: z.string().min(2, "Collection name must be at least 2 characters"),
  baseUrl: z.string().optional(),
  description: z.string().optional(),
});

type CreateCollectionFormValues = z.infer<typeof createCollectionSchema>;

interface CreateCollectionDialogProps {
  workspaceId: string;
}

export function CreateCollectionDialog({ workspaceId }: CreateCollectionDialogProps) {
  const [open, setOpen] = useState(false);
  const createCol = useCreateCollection(workspaceId);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCollectionFormValues>({
    resolver: zodResolver(createCollectionSchema),
    defaultValues: {
      name: "",
      baseUrl: "",
      description: "",
    },
  });

  const onSubmit = (data: CreateCollectionFormValues) => {
    createCol.mutate(data, {
      onSuccess: () => {
        toast.success("Collection created successfully");
        reset();
        setOpen(false);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Failed to create collection");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" className="gap-1.5 text-xs">
            <FolderPlus className="h-3.5 w-3.5" />
            New Collection
          </Button>
        }
      />

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Collection</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-3">
          <div className="space-y-2">
            <Label htmlFor="col-name">Collection Name</Label>
            <Input id="col-name" placeholder="User Service API" {...register("name")} />
            {errors.name && (
              <p className="text-xs text-[rgb(var(--danger))]">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="col-baseUrl">Base URL (Optional)</Label>
            <Input id="col-baseUrl" placeholder="https://api.example.com/v1" {...register("baseUrl")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="col-desc">Description</Label>
            <Textarea id="col-desc" placeholder="Endpoints for authentication and user profiles..." {...register("description")} />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createCol.isPending}>
              {createCol.isPending ? "Creating..." : "Create Collection"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
