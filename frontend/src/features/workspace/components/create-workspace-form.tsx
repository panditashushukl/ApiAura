"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreateWorkspace } from "../hooks/use-create-workspace";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const createWorkspaceSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Workspace name must be at least 2 characters")
        .max(150, "Workspace name cannot exceed 150 characters"),

    slug: z
        .string()
        .trim()
        .min(2, "Slug must be at least 2 characters")
        .max(100, "Slug cannot exceed 100 characters")
        .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            "Slug can contain lowercase letters, numbers and hyphens"
        ),

    description: z
        .string()
        .trim()
        .max(
            1000,
            "Description cannot exceed 1000 characters"
        )
        .optional(),
});

type CreateWorkspaceFormData =
    z.infer<typeof createWorkspaceSchema>;

interface CreateWorkspaceFormProps {
    organizationId: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function CreateWorkspaceForm({
    organizationId,
    onSuccess,
    onCancel,
}: CreateWorkspaceFormProps) {
    const createWorkspaceMutation =
        useCreateWorkspace();

    const {
        register,
        handleSubmit,
        setValue,
        formState: {
            errors,
        },
    } = useForm<CreateWorkspaceFormData>({
        resolver: zodResolver(
            createWorkspaceSchema
        ),
        defaultValues: {
            name: "",
            slug: "",
            description: "",
        },
    });

    const onSubmit = (
        data: CreateWorkspaceFormData
    ) => {
        createWorkspaceMutation.mutate(
            {
                organizationId,
                name: data.name,
                slug: data.slug,
                description:
                    data.description || undefined,
            },
            {
                onSuccess: () => {
                    onSuccess?.();
                },
            }
        );
    };

    const handleNameChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const name = event.target.value;

        setValue("name", name, {
            shouldValidate: true,
        });

        /*
         * Automatically generate a slug while
         * the user is creating the workspace.
         */
        setValue(
            "slug",
            name
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-"),
            {
                shouldValidate: true,
            }
        );
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
        >
            {/* Name */}
            <div className="space-y-2">
                <label
                    htmlFor="workspace-name"
                    className="text-sm font-medium"
                >
                    Workspace name
                </label>

                <Input
                    id="workspace-name"
                    placeholder="My API Workspace"
                    {...register("name")}
                    onChange={handleNameChange}
                    error={Boolean(errors.name)}
                />

                {errors.name && (
                    <p className="text-xs text-[rgb(var(--danger))]">
                        {errors.name.message}
                    </p>
                )}
            </div>

            {/* Slug */}
            <div className="space-y-2">
                <label
                    htmlFor="workspace-slug"
                    className="text-sm font-medium"
                >
                    Slug
                </label>

                <Input
                    id="workspace-slug"
                    placeholder="my-api-workspace"
                    {...register("slug")}
                    error={Boolean(errors.slug)}
                />

                {errors.slug && (
                    <p className="text-xs text-[rgb(var(--danger))]">
                        {errors.slug.message}
                    </p>
                )}

                <p className="text-xs text-[rgb(var(--muted-foreground))]">
                    Used as the workspace identifier.
                </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
                <label
                    htmlFor="workspace-description"
                    className="text-sm font-medium"
                >
                    Description
                </label>

                <textarea
                    id="workspace-description"
                    placeholder="Describe what this workspace is used for..."
                    rows={4}
                    {...register("description")}
                    className="
                        w-full
                        resize-none
                        rounded-lg
                        border
                        border-[rgb(var(--input))]
                        bg-[rgb(var(--background))]
                        px-3
                        py-2
                        text-sm
                        text-[rgb(var(--foreground))]
                        outline-none
                        transition
                        placeholder:text-[rgb(var(--muted-foreground))]
                        focus:border-[rgb(var(--ring))]
                        focus:ring-2
                        focus:ring-[rgb(var(--ring))]/20
                    "
                />

                {errors.description && (
                    <p className="text-xs text-[rgb(var(--danger))]">
                        {errors.description.message}
                    </p>
                )}
            </div>

            {/* Mutation error */}
            {createWorkspaceMutation.isError && (
                <div
                    className="
                        rounded-lg
                        border
                        border-[rgb(var(--danger))]/30
                        bg-[rgb(var(--danger))]/10
                        p-3
                        text-sm
                        text-[rgb(var(--danger))]
                    "
                >
                    {createWorkspaceMutation.error instanceof
                    Error
                        ? createWorkspaceMutation.error.message
                        : "Failed to create workspace."}
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onCancel}
                    disabled={
                        createWorkspaceMutation.isPending
                    }
                >
                    Cancel
                </Button>

                <Button
                    type="submit"
                    disabled={
                        createWorkspaceMutation.isPending
                    }
                >
                    {createWorkspaceMutation.isPending
                        ? "Creating..."
                        : "Create Workspace"}
                </Button>
            </div>
        </form>
    );
}