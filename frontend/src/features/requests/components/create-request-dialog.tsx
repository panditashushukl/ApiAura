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
import { useCreateRequest } from "../hooks/use-requests";
import { useToast } from "@/components/feedback/toast-system";


const createRequestSchema = z.object({
  name: z.string().min(2, "Request name required"),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]),
  url: z.string().min(1, "URL path required"),
});

type CreateRequestFormValues = z.infer<typeof createRequestSchema>;

interface CreateRequestDialogProps {
  collectionId: string;
  onCreated?: (requestId: string) => void;
}

export function CreateRequestDialog({ collectionId, onCreated }: CreateRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const createReq = useCreateRequest(collectionId);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateRequestFormValues>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      name: "",
      method: "GET",
      url: "https://api.example.com",
    },
  });

  const onSubmit = (data: CreateRequestFormValues) => {
    createReq.mutate(data, {
      onSuccess: (req) => {
        toast.success("API request created");
        reset();
        setOpen(false);
        onCreated?.(req.id);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Failed to create API request");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" variant="secondary" className="gap-1 text-xs">
            <Plus className="h-3.5 w-3.5" />
            New Request
          </Button>
        }
      />

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create API Request</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-3">
          <div className="space-y-2">
            <Label htmlFor="req-name">Request Name</Label>
            <Input id="req-name" placeholder="Get User Profile" {...register("name")} />
            {errors.name && (
              <p className="text-xs text-[rgb(var(--danger))]">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2 col-span-1">
              <Label htmlFor="req-method">Method</Label>
              <select
                id="req-method"
                {...register("method")}
                className="h-9 w-full px-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] text-xs font-mono font-bold"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
                <option value="HEAD">HEAD</option>
                <option value="OPTIONS">OPTIONS</option>
              </select>
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="req-url">Target URL</Label>
              <Input id="req-url" placeholder="https://api.example.com/users" {...register("url")} className="font-mono text-xs" />
              {errors.url && (
                <p className="text-xs text-[rgb(var(--danger))]">{errors.url.message}</p>
              )}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createReq.isPending}>
              {createReq.isPending ? "Creating..." : "Create Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
