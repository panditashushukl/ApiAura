"use client";

import { useState } from "react";
import { CollectionSidebarTree } from "@/features/collections/components/collection-sidebar-tree";
import { RequestBuilder } from "@/features/requests/components/request-builder";
import { useWorkspace } from "../hooks/use-workspace";
import { LoadingState } from "@/components/feedback/loading-state";
import { ErrorState } from "@/components/feedback/error-state";
import { Code2 } from "lucide-react";

interface WorkspaceWorkbenchProps {
  workspaceId: string;
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

  const handleSelectRequest = (requestId: string, collectionId: string) => {
    setSelectedState({ requestId, collectionId });
  };

  if (isLoading) return <LoadingState message="Loading workspace..." />;
  if (isError || !workspace) return <ErrorState message={error instanceof Error ? error.message : "Workspace not found."} />;

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-[rgb(var(--background))]">
      {/* Sidebar Navigation */}
      <CollectionSidebarTree
        workspaceId={workspaceId}
        selectedRequestId={selectedState.requestId}
        onSelectRequest={handleSelectRequest}
      />

      {/* Main Workspace Request Workbench */}
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
  );
}
