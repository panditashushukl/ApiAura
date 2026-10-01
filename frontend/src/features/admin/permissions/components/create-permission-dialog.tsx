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
import { useCreatePermission } from "../hooks/use-permissions";
import { useToast } from "@/components/feedback/toast-system";

const createPermissionSchema = z.object({
  name: z.string().min(2, "Name required"),
  code: z.string().min(2, "Permission code required"),
  resource: z.string().min(2, "Resource name required"),
  action: z.string().min(2, "Action required"),
  description: z.string().optional(),
});

type CreatePermissionFormValues = z.infer<typeof createPermissionSchema>;

export function CreatePermissionDialog() {
  const [open, setOpen] = useState(false);
  const createPermission = useCreatePermission();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreatePermissionFormValues>({
    resolver: zodResolver(createPermissionSchema),
    defaultValues: {
      name: "",
      code: "",
      resource: "",
      action: "",
      description: "",
    },
  });

  const onSubmit = (data: CreatePermissionFormValues) => {
    createPermission.mutate(data, {
      onSuccess: () => {
        toast.success("Permission created successfully");
        reset();
        setOpen(false);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Failed to create permission");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Permission
          </Button>
        }
      />


      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Register System Permission</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 pt-3">
          <div className="space-y-1">
            <Label htmlFor="perm-name">Name</Label>
            <Input id="perm-name" placeholder="Read Users" {...register("name")} />
            {errors.name && <p className="text-xs text-[rgb(var(--danger))]">{errors.name.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="perm-code">Code</Label>
            <Input id="perm-code" placeholder="USER_READ" {...register("code")} />
            {errors.code && <p className="text-xs text-[rgb(var(--danger))]">{errors.code.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="perm-res">Resource</Label>
              <Input id="perm-res" placeholder="USER" {...register("resource")} />
              {errors.resource && <p className="text-xs text-[rgb(var(--danger))]">{errors.resource.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="perm-act">Action</Label>
              <Input id="perm-act" placeholder="READ" {...register("action")} />
              {errors.action && <p className="text-xs text-[rgb(var(--danger))]">{errors.action.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="perm-desc">Description</Label>
            <Textarea id="perm-desc" placeholder="Allows viewing user list and details..." {...register("description")} />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createPermission.isPending}>
              {createPermission.isPending ? "Saving..." : "Create Permission"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
