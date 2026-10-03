"use client";

import { usePathname } from "next/navigation";
import { CollectionSidebarTree } from "@/features/collections/components/collection-sidebar-tree";
import { useUIStore } from "@/stores/ui.store";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { useEnvironments } from "@/features/environments/hooks/use-environments";
import { Environment } from "@/features/environments/types/environment.types";
import { CreateEnvironmentDialog } from "@/features/environments/components/create-environment-dialog";
import { useWorkflows } from "@/features/workflows/hooks/use-workflows";
import { CreateWorkflowDialog } from "@/features/workflows/components/create-workflow-dialog";
import { useMyHistory } from "@/features/history/hooks/use-history";

function SidebarEnvironments({ workspaceId }: { workspaceId: string | null }) {
    const { data: environments = [], isLoading } = useEnvironments(workspaceId);

    return (
        <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex h-14 items-center justify-between border-b border-[rgb(var(--sidebar-border))] px-4 font-semibold text-sm">
                <span className="flex items-center gap-2">
                    <span>◈</span> Environments List
                </span>
                {workspaceId && <CreateEnvironmentDialog workspaceId={workspaceId} />}
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {!workspaceId ? (
                    <div className="p-4 text-xs text-center text-[rgb(var(--muted-foreground))]">
                        Select a workspace to view environments.
                    </div>
                ) : isLoading ? (
                    <div className="p-4 text-xs text-center text-[rgb(var(--muted-foreground))]">
                        Loading environments...
                    </div>
                ) : environments.length === 0 ? (
                    <div className="p-4 text-xs text-center text-[rgb(var(--muted-foreground))]">
                        No environments created yet.
                    </div>
                ) : (
                    environments.map((env: Environment) => (
                        <div
                            key={env.id}
                            className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition ${
                                env.active
                                    ? "bg-[rgb(var(--primary))]/10 border-[rgb(var(--primary))] text-[rgb(var(--primary))] font-medium"
                                    : "border-[rgb(var(--sidebar-border))] hover:bg-[rgb(var(--sidebar-accent))] text-[rgb(var(--muted-foreground))]"
                            }`}
                        >
                            <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                                <span className={`h-2 w-2 rounded-full shrink-0 ${env.active ? "bg-emerald-500" : "bg-zinc-400"}`} />
                                <span className="truncate">{env.name}</span>
                            </div>
                            <span className="text-[10px] opacity-70 shrink-0 ml-2">
                                {env.active ? "ACTIVE" : env.status}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function SidebarWorkflows({ workspaceId }: { workspaceId: string | null }) {
    const { data: workflows = [], isLoading } = useWorkflows(workspaceId);

    return (
        <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex h-14 items-center justify-between border-b border-[rgb(var(--sidebar-border))] px-4 font-semibold text-sm">
                <span className="flex items-center gap-2">
                    <span>◇</span> Workflows & Pipelines
                </span>
                {workspaceId && <CreateWorkflowDialog workspaceId={workspaceId} />}
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {!workspaceId ? (
                    <div className="p-4 text-xs text-center text-[rgb(var(--muted-foreground))]">
                        Select a workspace to view workflows.
                    </div>
                ) : isLoading ? (
                    <div className="p-4 text-xs text-center text-[rgb(var(--muted-foreground))]">
                        Loading workflows...
                    </div>
                ) : workflows.length === 0 ? (
                    <div className="p-4 text-xs text-center text-[rgb(var(--muted-foreground))]">
                        No workflows created yet.
                    </div>
                ) : (
                    workflows.map((wf) => (
                        <div
                            key={wf.id}
                            className="p-3 rounded-lg border border-[rgb(var(--sidebar-border))] hover:bg-[rgb(var(--sidebar-accent))] transition space-y-1 cursor-pointer"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-medium truncate">{wf.name}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgb(var(--secondary))] text-[rgb(var(--muted-foreground))] font-mono uppercase shrink-0">
                                    {wf.status || "ACTIVE"}
                                </span>
                            </div>
                            {wf.description && (
                                <div className="text-[11px] text-[rgb(var(--muted-foreground))] truncate">
                                    {wf.description}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function SidebarHistory() {
    const { data: pageData, isLoading } = useMyHistory(0, 15);
    const historyItems = pageData?.content || [];

    const getMethodColor = (method: string) => {
        switch (method?.toUpperCase()) {
            case "GET":
                return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400";
            case "POST":
                return "bg-amber-500/15 text-amber-600 dark:text-amber-400";
            case "PUT":
                return "bg-blue-500/15 text-blue-600 dark:text-blue-400";
            case "DELETE":
                return "bg-red-500/15 text-red-600 dark:text-red-400";
            default:
                return "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400";
        }
    };

    return (
        <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex h-14 items-center justify-between border-b border-[rgb(var(--sidebar-border))] px-4 font-semibold text-sm">
                <span className="flex items-center gap-2">
                    <span>◷</span> Execution History
                </span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {isLoading ? (
                    <div className="p-4 text-xs text-center text-[rgb(var(--muted-foreground))]">
                        Loading execution history...
                    </div>
                ) : historyItems.length === 0 ? (
                    <div className="p-4 text-xs text-center text-[rgb(var(--muted-foreground))]">
                        No request executions recorded yet.
                    </div>
                ) : (
                    historyItems.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center justify-between p-2.5 rounded-lg border border-[rgb(var(--sidebar-border))] hover:bg-[rgb(var(--sidebar-accent))] transition text-xs cursor-pointer"
                        >
                            <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                                <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono shrink-0 ${getMethodColor(
                                        item.method
                                    )}`}
                                >
                                    {item.method}
                                </span>
                                <span className="truncate font-mono text-[11px] text-[rgb(var(--foreground))]">
                                    {item.url}
                                </span>
                            </div>
                            <span className="text-[10px] text-[rgb(var(--muted-foreground))] ml-2 shrink-0">
                                {new Date(item.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export function SecondarySidebar() {
    const pathname = usePathname();
    const { secondarySidebarOpen } = useUIStore();
    const { selectedWorkspaceId, selectedRequestId, setSelectedRequest } = useWorkspaceStore();

    // Determine which section is active based on path
    const isCollections = pathname.startsWith("/collections");
    const isEnvironments = pathname.startsWith("/environments");
    const isWorkflows = pathname.startsWith("/workflows");
    const isHistory = pathname.startsWith("/history");

    // Hide secondary sidebar for Overview, Admin, Settings, etc.
    const shouldShow = isCollections || isEnvironments || isWorkflows || isHistory;

    if (!shouldShow || !secondarySidebarOpen) {
        return null;
    }

    return (
        <aside
            className="
                flex
                h-screen
                w-72
                shrink-0
                flex-col
                border-r
                border-[rgb(var(--sidebar-border))]
                bg-[rgb(var(--sidebar))]/70
                backdrop-blur-md
                text-[rgb(var(--sidebar-foreground))]
                transition-all
                duration-200
            "
        >
            {isCollections && (
                <div className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex h-14 items-center justify-between border-b border-[rgb(var(--sidebar-border))] px-4 font-semibold text-sm">
                        <span className="flex items-center gap-2">
                            <span>▣</span> Collections & API Folders
                        </span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2">
                        {selectedWorkspaceId ? (
                            <CollectionSidebarTree
                                workspaceId={selectedWorkspaceId}
                                selectedRequestId={selectedRequestId}
                                onSelectRequest={(reqId, colId) => setSelectedRequest(reqId, colId)}
                            />
                        ) : (
                            <div className="p-4 text-xs text-center text-[rgb(var(--muted-foreground))]">
                                Please select a workspace to view collections.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {isEnvironments && <SidebarEnvironments workspaceId={selectedWorkspaceId} />}

            {isWorkflows && <SidebarWorkflows workspaceId={selectedWorkspaceId} />}

            {isHistory && <SidebarHistory />}
        </aside>
    );
}
