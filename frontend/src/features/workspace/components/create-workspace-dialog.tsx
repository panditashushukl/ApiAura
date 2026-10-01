"use client";

import { useState } from "react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { CreateWorkspaceForm } from "./create-workspace-form";

interface CreateWorkspaceDialogProps {
    organizationId: string;
}

export function CreateWorkspaceDialog({
    organizationId,
}: CreateWorkspaceDialogProps) {
    const [open, setOpen] =
        useState(false);

    return (
        <Dialog
            open={open}
            onOpenChange={setOpen}
        >
            <DialogTrigger
                render={
                    <Button>
                        <span className="text-base">
                            +
                        </span>

                        Create Workspace
                    </Button>
                }
            />



            <DialogContent
                className="
                    border-[rgb(var(--border))]
                    bg-[rgb(var(--card))]
                    text-[rgb(var(--card-foreground))]
                    sm:max-w-lg
                "
            >
                <DialogHeader>
                    <DialogTitle>
                        Create workspace
                    </DialogTitle>

                    <DialogDescription>
                        Create a workspace for organizing
                        your collections, requests,
                        environments and workflows.
                    </DialogDescription>
                </DialogHeader>

                <CreateWorkspaceForm
                    organizationId={
                        organizationId
                    }
                    onSuccess={() =>
                        setOpen(false)
                    }
                    onCancel={() =>
                        setOpen(false)
                    }
                />
            </DialogContent>
        </Dialog>
    );
}