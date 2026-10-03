"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Code2 } from "lucide-react";

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
  description: z.string().optional(),
  preRequestScript: z.string().optional(),
  postRequestScript: z.string().optional(),
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
  const [activeTab, setActiveTab] = useState<"general" | "pre-script" | "post-script">("general");
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
      description: "",
      preRequestScript: "",
      postRequestScript: "",
    },
  });

  useEffect(() => {
    if (collection) {
      reset({
        name: collection.name || "",
        description: collection.description || "",
        preRequestScript: collection.preRequestScript || "",
        postRequestScript: collection.postRequestScript || "",
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
      <DialogContent className="sm:max-w-lg border-[rgb(var(--border))]/60 bg-[rgb(var(--card))]/95 backdrop-blur-2xl glass-dropdown">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">Edit Collection</DialogTitle>
        </DialogHeader>

        {/* Tab Headers */}
        <div className="flex border-b border-[rgb(var(--border))]/50 gap-2 text-xs font-semibold pt-1">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`px-3 py-1.5 border-b-2 transition-all ${
              activeTab === "general"
                ? "border-[rgb(var(--primary))] text-[rgb(var(--primary))]"
                : "border-transparent text-[rgb(var(--muted-foreground))]"
            }`}
          >
            General Details
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pre-script")}
            className={`px-3 py-1.5 border-b-2 transition-all flex items-center gap-1 ${
              activeTab === "pre-script"
                ? "border-[rgb(var(--primary))] text-[rgb(var(--primary))]"
                : "border-transparent text-[rgb(var(--muted-foreground))]"
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            Pre-request Script
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("post-script")}
            className={`px-3 py-1.5 border-b-2 transition-all flex items-center gap-1 ${
              activeTab === "post-script"
                ? "border-[rgb(var(--primary))] text-[rgb(var(--primary))]"
                : "border-transparent text-[rgb(var(--muted-foreground))]"
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            Tests / Post-script
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {activeTab === "general" && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-col-name" className="text-xs font-semibold">
                  Collection Name
                </Label>
                <Input id="edit-col-name" {...register("name")} className="text-xs" />
                {errors.name && (
                  <p className="text-xs text-[rgb(var(--danger))]">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-col-desc" className="text-xs font-semibold">
                  Description
                </Label>
                <Textarea id="edit-col-desc" {...register("description")} rows={3} className="text-xs" />
              </div>
            </div>
          )}

          {activeTab === "pre-script" && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Collection-level Pre-request Script</Label>
              <Textarea
                placeholder="// Executed before requests in this collection\npm.environment.set('timestamp', Date.now());"
                {...register("preRequestScript")}
                rows={6}
                className="font-mono text-xs"
              />
            </div>
          )}

          {activeTab === "post-script" && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Collection-level Tests / Post-script</Label>
              <Textarea
                placeholder="// Executed after requests in this collection\npm.test('Status code is 200', function() {\n  pm.response.to.have.status(200);\n});"
                {...register("postRequestScript")}
                rows={6}
                className="font-mono text-xs"
              />
            </div>
          )}

          <DialogFooter className="pt-2 border-t border-[rgb(var(--border))]/50">
            <Button type="button" variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={updateCol.isPending}>
              {updateCol.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
