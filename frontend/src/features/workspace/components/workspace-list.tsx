"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FolderGit2, CheckCircle2, Trash2, ExternalLink, Plus, Pencil, Building2 } from "lucide-react";

import { useWorkspaces } from "../hooks/use-workspaces";
import { useDeleteWorkspace } from "../hooks/use-delete-workspace";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { useOrganizationStore } from "@/stores/organization.store";
import { useOrganizations } from "@/features/admin/organizations/hooks/use-organizations";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateWorkspaceDialog } from "./create-workspace-dialog";
import { EditWorkspaceDialog } from "./edit-workspace-dialog";
import { OrganizationJoinModal } from "@/features/organizations/components/organization-join-modal";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { LoadingState } from "@/components/feedback/loading-state";
import { ErrorState } from "@/components/feedback/error-state";
import { EmptyState } from "@/components/feedback/empty-state";
import { Workspace } from "../types/workspace.types";
import { useToast } from "@/components/feedback/toast-system";

export function WorkspaceList() {
    const router = useRouter();
    const { data: workspaces = [], isLoading, isError, error, refetch } = useWorkspaces();
    const { data: organizations = [] } = useOrganizations();
    const { selectedOrganizationId, setSelectedOrganizationId } = useOrganizationStore();
    const { selectedWorkspaceId, setSelectedWorkspace } = useWorkspaceStore();
    const deleteWorkspaceMutation = useDeleteWorkspace();
    const toast = useToast();

    const [deletingWorkspace, setDeletingWorkspace] = useState<Workspace | null>(null);
    const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
    const [joinModalOpen, setJoinModalOpen] = useState(false);

    const activeOrgId = selectedOrganizationId || (organizations.length > 0 ? organizations[0].id : null);

    const filteredWorkspaces = useMemo(() => {
        if (!selectedOrganizationId) return workspaces;
        return workspaces.filter((w) => !w.organizationId || w.organizationId === selectedOrganizationId);
    }, [workspaces, selectedOrganizationId]);

    const handleDelete = () => {
        if (!deletingWorkspace) return;
        deleteWorkspaceMutation.mutate(deletingWorkspace.id, {
            onSuccess: () => {
                toast.success("Workspace deleted successfully");
                if (selectedWorkspaceId === deletingWorkspace.id) {
                    const remaining = workspaces.filter((w) => w.id !== deletingWorkspace.id);
                    setSelectedWorkspace(remaining.length > 0 ? remaining[0].id : "");
                }
                setDeletingWorkspace(null);
            },
            onError: (err) => {
                toast.error(err instanceof Error ? err.message : "Failed to delete workspace");
            },
        });
    };

    if (isLoading) return <LoadingState message="Loading workspaces..." />;
    if (isError) return <ErrorState message={error instanceof Error ? error.message : "Failed to load workspaces."} onRetry={() => refetch()} />;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Workspace Management</h1>
                    <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">
                        Create, switch, and manage team API environments and workspace permissions.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        onClick={() => setJoinModalOpen(true)}
                        className="gap-1.5 text-xs font-semibold"
                    >
                        <Building2 className="h-4 w-4 text-[rgb(var(--primary))]" />
                        Join Organization
                    </Button>
                    <CreateWorkspaceDialog organizationId={activeOrgId || undefined} />
                </div>
            </div>

            {/* Scope Filter */}
            {organizations.length > 0 && (
                <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-[rgb(var(--muted-foreground))]">Filter by Organization:</span>
                    <select
                        value={selectedOrganizationId || ""}
                        onChange={(e) => setSelectedOrganizationId(e.target.value || null)}
                        className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]"
                    >
                        <option value="">All Organizations</option>
                        {organizations.map((org) => (
                            <option key={org.id} value={org.id}>
                                {org.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Content */}
            {filteredWorkspaces.length === 0 ? (
                <EmptyState
                    icon={<FolderGit2 className="w-10 h-10 text-[rgb(var(--muted-foreground))]" />}
                    title="No Workspaces Available"
                    description="Create a workspace to start organizing your API endpoints and collections."
                    actionNode={<CreateWorkspaceDialog organizationId={activeOrgId || undefined} />}
                />
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredWorkspaces.map((workspace) => {
                        const isActive = selectedWorkspaceId === workspace.id;

                        return (
                            <Card
                                key={workspace.id}
                                onClick={() => {
                                    setSelectedWorkspace(workspace.id);
                                    router.push("/collections");
                                }}
                                className={`flex flex-col justify-between transition-all cursor-pointer ${
                                    isActive
                                        ? "border-2 border-[rgb(var(--primary))] shadow-md bg-[rgb(var(--primary))]/5"
                                        : "hover:border-[rgb(var(--primary))]/40"
                                }`}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <CardTitle className="text-base font-semibold flex items-center gap-2 truncate">
                                            <FolderGit2 className={`h-4 w-4 ${isActive ? "text-[rgb(var(--primary))]" : "text-[rgb(var(--muted-foreground))]"}`} />
                                            {workspace.name}
                                        </CardTitle>

                                        {isActive ? (
                                            <Badge variant="success" className="gap-1 text-[10px] uppercase">
                                                <CheckCircle2 className="h-3 w-3" />
                                                Active
                                            </Badge>
                                        ) : (
                                            <Badge variant="default" className="text-[10px] uppercase">
                                                {workspace.status || "ACTIVE"}
                                            </Badge>
                                        )}
                                    </div>

                                    {workspace.description && (
                                        <CardDescription className="text-xs line-clamp-2 mt-1">
                                            {workspace.description}
                                        </CardDescription>
                                    )}
                                </CardHeader>

                                <CardFooter className="pt-3 border-t border-[rgb(var(--border))] flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        {!isActive && (
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="h-8 text-xs font-semibold"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedWorkspace(workspace.id);
                                                }}
                                            >
                                                Select Active
                                            </Button>
                                        )}

                                        <Link href={`/workspaces/${workspace.id}`} onClick={(e) => e.stopPropagation()}>
                                            <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                                                <ExternalLink className="h-3.5 w-3.5" />
                                                Workbench
                                            </Button>
                                        </Link>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
                                            title="Edit Workspace"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingWorkspace(workspace);
                                            }}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-[rgb(var(--danger))] hover:bg-[rgb(var(--danger))]/10"
                                            title="Delete Workspace"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDeletingWorkspace(workspace);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}

            <EditWorkspaceDialog
                workspace={editingWorkspace}
                open={Boolean(editingWorkspace)}
                onOpenChange={(open) => !open && setEditingWorkspace(null)}
            />

            <ConfirmDialog
                open={Boolean(deletingWorkspace)}
                onOpenChange={(open) => !open && setDeletingWorkspace(null)}
                title="Delete Workspace"
                description={`Are you sure you want to delete workspace "${deletingWorkspace?.name}"? All collections and requests inside will be permanently deleted.`}
                confirmText="Delete Workspace"
                variant="danger"
                onConfirm={handleDelete}
            />
            <OrganizationJoinModal
                isOpen={joinModalOpen}
                onClose={() => setJoinModalOpen(false)}
            />
        </div>
    );
}