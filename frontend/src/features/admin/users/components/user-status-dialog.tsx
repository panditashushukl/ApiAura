"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUpdateUserStatus } from "../hooks/use-update-user-status";
import { User, UserStatus } from "../types/user.types";
import { useToast } from "@/components/feedback/toast-system";

interface UserStatusDialogProps {
  user: User | null;
  targetStatus: UserStatus | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserStatusDialog({
  user,
  targetStatus,
  open,
  onOpenChange,
}: UserStatusDialogProps) {
  const updateStatus = useUpdateUserStatus();
  const toast = useToast();

  if (!user || !targetStatus) return null;

  const handleConfirm = () => {
    updateStatus.mutate(
      { userId: user.id, request: { status: targetStatus } },
      {
        onSuccess: () => {
          toast.success(`User status updated to ${targetStatus}`);
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Failed to update user status");
        },
      }
    );
  };

  const actionText =
    targetStatus === "ACTIVE"
      ? "activate"
      : targetStatus === "SUSPENDED"
      ? "suspend"
      : "deactivate";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="capitalize">
            {actionText} User
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to {actionText} <strong>{user.name || user.email}</strong>?
            This will change their platform access status.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-4">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant={targetStatus === "SUSPENDED" ? "danger" : "primary"}
            onClick={handleConfirm}
            disabled={updateStatus.isPending}
          >
            {updateStatus.isPending ? "Updating..." : `Confirm ${targetStatus}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
