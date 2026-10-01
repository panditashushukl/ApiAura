"use client";

import { useWorkspaceStore } from "@/stores/workspace.store";
import { AiChatInterface } from "@/features/ai/components/ai-chat-interface";
import { useWorkspaces } from "@/features/workspace/hooks/use-workspaces";
import { LoadingState } from "@/components/feedback/loading-state";
import { Layers } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AiPage() {
  const { selectedWorkspaceId } = useWorkspaceStore();
  const { data: workspaces = [], isLoading } = useWorkspaces();

  const activeWorkspaceId =
    selectedWorkspaceId || (workspaces.length > 0 ? workspaces[0].id : null);

  if (isLoading) {
    return <LoadingState message="Loading AI workspace..." />;
  }

  if (!activeWorkspaceId) {
    return (
      <div className="p-12 text-center max-w-md mx-auto space-y-4">
        <Layers className="h-10 w-10 mx-auto text-[rgb(var(--muted-foreground))]" />
        <h2 className="text-lg font-semibold">No Workspace Selected</h2>
        <p className="text-xs text-[rgb(var(--muted-foreground))]">
          Please select or create a workspace first before interacting with the AI Agent.
        </p>
        <Link href="/workspaces">
          <Button size="sm">Go to Workspaces</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <AiChatInterface workspaceId={activeWorkspaceId} />
    </div>
  );
}
