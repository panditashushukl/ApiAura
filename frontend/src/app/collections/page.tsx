"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { RequestBuilder } from "@/features/requests/components/request-builder";
import { useRequestDetail } from "@/features/requests/hooks/use-requests";
import { Code2, Maximize2, Minimize2, X, FolderGit2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OpenTab {
    requestId: string;
    collectionId: string;
}

import { RequestTabHeader } from "@/features/requests/components/request-tab-header";

export default function CollectionsPage() {
    const { selectedWorkspaceId, selectedRequestId, selectedCollectionId, setSelectedRequest } = useWorkspaceStore();
    const [openTabs, setOpenTabs] = useState<OpenTab[]>([]);
    const [isFullScreen, setIsFullScreen] = useState(false);

    // Synchronize selected request from sidebar into open tabs
    useEffect(() => {
        if (selectedRequestId && selectedCollectionId) {
            setOpenTabs((prev) => {
                if (prev.some((t) => t.requestId === selectedRequestId)) return prev;
                return [...prev, { requestId: selectedRequestId, collectionId: selectedCollectionId }];
            });
        }
    }, [selectedRequestId, selectedCollectionId]);

    const handleCloseTab = (reqIdToClose: string) => {
        const updated = openTabs.filter((t) => t.requestId !== reqIdToClose);
        setOpenTabs(updated);

        if (selectedRequestId === reqIdToClose) {
            if (updated.length > 0) {
                const last = updated[updated.length - 1];
                setSelectedRequest(last.requestId, last.collectionId);
            } else {
                setSelectedRequest(null, null);
            }
        }
    };

    const renderWorkbench = () => (
        <div className={`flex flex-col h-full bg-[rgb(var(--background))] ${isFullScreen ? "fixed inset-0 z-50 p-4" : ""}`}>
            {/* Workbench Header & Tabs Bar */}
            <div className="flex items-center justify-between border-b border-[rgb(var(--border))] bg-[rgb(var(--card))]/50 px-3 py-1 gap-2 overflow-x-auto text-xs">
                <div className="flex items-center gap-1 overflow-x-auto">
                    {openTabs.map((tab) => (
                        <RequestTabHeader
                            key={tab.requestId}
                            requestId={tab.requestId}
                            isActive={selectedRequestId === tab.requestId}
                            onSelect={() => setSelectedRequest(tab.requestId, tab.collectionId)}
                            onClose={(e) => {
                                e.stopPropagation();
                                handleCloseTab(tab.requestId);
                            }}
                        />
                    ))}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsFullScreen(!isFullScreen)}
                        className="h-8 gap-1.5 text-xs font-medium"
                    >
                        {isFullScreen ? (
                            <>
                                <Minimize2 className="h-3.5 w-3.5" />
                                Exit Full Screen
                            </>
                        ) : (
                            <>
                                <Maximize2 className="h-3.5 w-3.5" />
                                Full Screen
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Main Workbench Body */}
            <div className="flex-1 overflow-hidden p-4">
                {selectedRequestId && selectedCollectionId ? (
                    <RequestBuilder
                        key={selectedRequestId}
                        requestId={selectedRequestId}
                        collectionId={selectedCollectionId}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full border border-[rgb(var(--border))] rounded-xl bg-[rgb(var(--card))] p-6 text-center text-[rgb(var(--muted-foreground))] shadow-sm">
                        <div className="h-16 w-16 rounded-2xl bg-[rgb(var(--primary))]/10 flex items-center justify-center mb-4">
                            <Code2 className="h-8 w-8 text-[rgb(var(--primary))]" />
                        </div>
                        <h2 className="text-lg font-semibold text-[rgb(var(--foreground))]">Collections Workbench</h2>
                        <p className="text-xs max-w-sm mt-1">
                            Select or create an API request from the collections sidebar tree to start configuring headers, params, body, and sending live API requests.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <AppShell>
            {!selectedWorkspaceId ? (
                <div className="flex flex-col items-center justify-center h-[calc(100vh-6rem)] p-6 text-center">
                    <div className="h-16 w-16 rounded-2xl bg-[rgb(var(--primary))]/10 flex items-center justify-center mb-4">
                        <FolderGit2 className="h-8 w-8 text-[rgb(var(--primary))]" />
                    </div>
                    <h2 className="text-lg font-semibold">No Active Workspace Selected</h2>
                    <p className="text-xs text-[rgb(var(--muted-foreground))] max-w-sm mt-1 mb-4">
                        Please select a workspace to view and execute its API collections and request endpoints.
                    </p>
                    <Link href="/workspaces">
                        <Button size="sm">Go to Workspaces</Button>
                    </Link>
                </div>
            ) : (
                renderWorkbench()
            )}
        </AppShell>
    );
}
