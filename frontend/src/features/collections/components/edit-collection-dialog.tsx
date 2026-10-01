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
import { useUpdateCollection } from "../hooks/use-collections";
import { Collection } from "../types/collection.types";
import { useToast } from "@/components/feedback/toast-system";

const editCollectionSchema = z.object({
  name: z.string().min(2, "Collection name must be at least 2 characters"),
  baseUrl: z.string().optional(),
  description: z.string().optional(),
});

type EditCollectionFormValues = z.infer<typeof editCollectionSchema>;

interface EditCollectionDialogProps {
  collection: Collection | null;
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCollectionDialog({
  collection,
  workspaceId,
  open,
  onOpenChange,
}: EditCollectionDialogProps) {
  const updateCol = useUpdateCollection(workspaceId);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditCollectionFormValues>({
    resolver: zodResolver(editCollectionSchema),
    defaultValues: {
      name: "",
      baseUrl: "",
      description: "",
    },
  });

  useEffect(() => {
    if (collection) {
      reset({
        name: collection.name || "",
        baseUrl: collection.baseUrl || "",
        description: collection.description || "",
      });
    }
  }, [collection, reset]);

  const onSubmit = (data: EditCollectionFormValues) => {
    if (!collection) return;
    updateCol.mutate(
      { collectionId: collection.id, request: data },
      {
        onSuccess: () => {
          toast.success("Collection updated successfully");
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Failed to update collection");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Collection</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-3">
          <div className="space-y-2">
            <Label htmlFor="edit-col-name">Collection Name</Label>
            <Input id="edit-col-name" {...register("name")} />
            {errors.name && (
              <p className="text-xs text-[rgb(var(--danger))]">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-col-baseUrl">Base URL</Label>
            <Input id="edit-col-baseUrl" {...register("baseUrl")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-col-desc">Description</Label>
            <Textarea id="edit-col-desc" {...register("description")} />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateCol.isPending}>
              {updateCol.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
