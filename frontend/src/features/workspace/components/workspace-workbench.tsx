"use client";

import { useState } from "react";
import Link from "next/link";
import { CollectionSidebarTree } from "@/features/collections/components/collection-sidebar-tree";
import { RequestBuilder } from "@/features/requests/components/request-builder";
import { RequestTabHeader } from "@/features/requests/components/request-tab-header";
import { useWorkspace } from "../hooks/use-workspace";
import { LoadingState } from "@/components/feedback/loading-state";
import { ErrorState } from "@/components/feedback/error-state";
import { ArrowLeft, Code2, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkspaceWorkbenchProps {
  workspaceId: string;
}

interface OpenTab {
  requestId: string;
  collectionId: string;
}

export function WorkspaceWorkbench({ workspaceId }: WorkspaceWorkbenchProps) {
  const { data: workspace, isLoading, isError, error } = useWorkspace(workspaceId);
  const [selectedState, setSelectedState] = useState<{
    requestId: string | null;
    collectionId: string | null;
  }>({
    requestId: null,
    collectionId: null,
  });
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([]);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleSelectRequest = (requestId: string, collectionId: string) => {
    setSelectedState({ requestId, collectionId });
    setOpenTabs((prev) => {
      if (prev.some((t) => t.requestId === requestId)) return prev;
      return [...prev, { requestId, collectionId }];
    });
  };

  const handleCloseTab = (reqIdToClose: string) => {
    const updated = openTabs.filter((t) => t.requestId !== reqIdToClose);
    setOpenTabs(updated);

    if (selectedState.requestId === reqIdToClose) {
      if (updated.length > 0) {
        const last = updated[updated.length - 1];
        setSelectedState({ requestId: last.requestId, collectionId: last.collectionId });
      } else {
        setSelectedState({ requestId: null, collectionId: null });
      }
    }
  };

  if (isLoading) return <LoadingState message="Loading workspace..." />;
  if (isError || !workspace) return <ErrorState message={error instanceof Error ? error.message : "Workspace not found."} />;

  return (
    <div className={`flex h-[calc(100vh-4rem)] overflow-hidden bg-[rgb(var(--background))] ${isFullScreen ? "fixed inset-0 z-50 h-screen w-screen p-4 bg-[rgb(var(--background))]" : ""}`}>
      {/* Sidebar Navigation */}
      {!isFullScreen && (
        <CollectionSidebarTree
          workspaceId={workspaceId}
          selectedRequestId={selectedState.requestId}
          onSelectRequest={handleSelectRequest}
        />
      )}

      {/* Main Workspace Request Workbench */}
      <div className="flex-1 overflow-hidden flex flex-col min-w-0">
        {/* Workbench Header & Tabs Bar */}
        <div className="flex items-center justify-between border-b border-[rgb(var(--border))] bg-[rgb(var(--card))]/50 px-3 py-1 gap-2 overflow-x-auto text-xs">
          <div className="flex items-center gap-2 overflow-x-auto">
            {/* Back Button */}
            <Link href="/workspaces">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 gap-1.5 text-xs font-medium text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--accent))] shrink-0 rounded-md"
                title="Back to Workspaces"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </Button>
            </Link>

            <div className="h-4 w-px bg-[rgb(var(--border))] shrink-0" />

            {/* Request Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto">
              {openTabs.map((tab) => (
                <RequestTabHeader
                  key={tab.requestId}
                  requestId={tab.requestId}
                  isActive={selectedState.requestId === tab.requestId}
                  onSelect={() => setSelectedState({ requestId: tab.requestId, collectionId: tab.collectionId })}
                  onClose={(e) => {
                    e.stopPropagation();
                    handleCloseTab(tab.requestId);
                  }}
                />
              ))}
            </div>
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

        {/* Workbench Content */}
        <div className="flex-1 p-4 overflow-hidden flex flex-col min-w-0">
          {selectedState.requestId && selectedState.collectionId ? (
            <RequestBuilder
              key={selectedState.requestId}
              requestId={selectedState.requestId}
              collectionId={selectedState.collectionId}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full border border-[rgb(var(--border))] rounded-xl bg-[rgb(var(--card))] p-6 text-center text-[rgb(var(--muted-foreground))]">
              <div className="h-16 w-16 rounded-2xl bg-[rgb(var(--primary))]/10 flex items-center justify-center mb-4">
                <Code2 className="h-8 w-8 text-[rgb(var(--primary))]" />
              </div>
              <h2 className="text-lg font-semibold text-[rgb(var(--foreground))]">Workspace Workbench</h2>
              <p className="text-xs max-w-sm mt-1">
                Select or create an API request from the collections sidebar to start building, configuring headers, parameters, and sending HTTP requests.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
