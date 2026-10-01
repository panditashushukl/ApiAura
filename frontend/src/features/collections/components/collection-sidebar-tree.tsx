"use client";

import { useMemo, useState } from "react";
import { ChevronRight, ChevronDown, Folder, Search, Trash2, Edit } from "lucide-react";

import { useCollections, useDeleteCollection } from "../hooks/use-collections";
import { useCollectionRequests, useDeleteRequest } from "@/features/requests/hooks/use-requests";
import { CreateCollectionDialog } from "./create-collection-dialog";
import { EditCollectionDialog } from "./edit-collection-dialog";
import { CreateRequestDialog } from "@/features/requests/components/create-request-dialog";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/feedback/loading-state";
import { EmptyState } from "@/components/feedback/empty-state";
import { Collection } from "../types/collection.types";
import { useToast } from "@/components/feedback/toast-system";

interface CollectionSidebarTreeProps {
  workspaceId: string;
  selectedRequestId: string | null;
  onSelectRequest: (requestId: string, collectionId: string) => void;
}

export function CollectionSidebarTree({
  workspaceId,
  selectedRequestId,
  onSelectRequest,
}: CollectionSidebarTreeProps) {
  const { data: collections = [], isLoading } = useCollections(workspaceId);

  const [search, setSearch] = useState("");
  const [expandedCollections, setExpandedCollections] = useState<Record<string, boolean>>({});
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [deletingCollection, setDeletingCollection] = useState<Collection | null>(null);

  const toggleExpand = (colId: string) => {
    setExpandedCollections((prev) => ({
      ...prev,
      [colId]: !prev[colId],
    }));
  };

  const filteredCollections = useMemo(() => {
    if (!search.trim()) return collections;
    const q = search.toLowerCase().trim();
    return collections.filter(
      (c) => c.name.toLowerCase().includes(q) || c.baseUrl?.toLowerCase().includes(q)
    );
  }, [collections, search]);

  if (isLoading) return <LoadingState message="Loading collections..." />;

  return (
    <div className="flex flex-col h-full border-r border-[rgb(var(--border))] bg-[rgb(var(--card))] w-72 shrink-0 overflow-hidden">
      {/* Sidebar Top Header */}
      <div className="p-3 border-b border-[rgb(var(--border))] space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--muted-foreground))]">
            Collections
          </h2>
          <CreateCollectionDialog workspaceId={workspaceId} />
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[rgb(var(--muted-foreground))]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search API requests..."
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      {/* Tree Content Area */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredCollections.length === 0 ? (
          <EmptyState
            title="No Collections"
            description="Create a collection to organize your API endpoints."
          />
        ) : (
          filteredCollections.map((collection) => (
            <CollectionTreeNode
              key={collection.id}
              collection={collection}
              isExpanded={Boolean(expandedCollections[collection.id])}
              onToggleExpand={() => toggleExpand(collection.id)}
              selectedRequestId={selectedRequestId}
              onSelectRequest={onSelectRequest}
              onEditCollection={() => setEditingCollection(collection)}
              onDeleteCollection={() => setDeletingCollection(collection)}
            />
          ))
        )}
      </div>

      {/* Modals */}
      <EditCollectionDialog
        collection={editingCollection}
        workspaceId={workspaceId}
        open={Boolean(editingCollection)}
        onOpenChange={(open) => !open && setEditingCollection(null)}
      />

      <ConfirmCollectionDeleteDialog
        collection={deletingCollection}
        workspaceId={workspaceId}
        open={Boolean(deletingCollection)}
        onOpenChange={(open) => !open && setDeletingCollection(null)}
      />
    </div>
  );
}

// Sub-component for each Collection Node in Tree
interface CollectionTreeNodeProps {
  collection: Collection;
  isExpanded: boolean;
  onToggleExpand: () => void;
  selectedRequestId: string | null;
  onSelectRequest: (requestId: string, collectionId: string) => void;
  onEditCollection: () => void;
  onDeleteCollection: () => void;
}

function CollectionTreeNode({
  collection,
  isExpanded,
  onToggleExpand,
  selectedRequestId,
  onSelectRequest,
  onEditCollection,
  onDeleteCollection,
}: CollectionTreeNodeProps) {
  const { data: requests = [], isLoading } = useCollectionRequests(isExpanded ? collection.id : null);
  const deleteReq = useDeleteRequest(collection.id);
  const toast = useToast();

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET": return "text-[rgb(var(--success))]";
      case "POST": return "text-[rgb(var(--warning))]";
      case "PUT": return "text-[rgb(var(--info))]";
      case "DELETE": return "text-[rgb(var(--danger))]";
      default: return "text-[rgb(var(--muted-foreground))]";
    }
  };

  return (
    <div className="space-y-0.5">
      {/* Collection Header Row */}
      <div className="flex items-center justify-between group px-2 py-1.5 rounded-md hover:bg-[rgb(var(--muted))]/50 transition-colors text-xs cursor-pointer">
        <div className="flex items-center gap-1.5 min-w-0 flex-1" onClick={onToggleExpand}>
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[rgb(var(--muted-foreground))]" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[rgb(var(--muted-foreground))]" />
          )}
          <Folder className="h-4 w-4 text-[rgb(var(--primary))] shrink-0" />
          <span className="font-semibold truncate text-[rgb(var(--foreground))]">{collection.name}</span>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <CreateRequestDialog collectionId={collection.id} onCreated={(reqId) => onSelectRequest(reqId, collection.id)} />
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onEditCollection}>
            <Edit className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onDeleteCollection}>
            <Trash2 className="h-3 w-3 text-[rgb(var(--danger))]" />
          </Button>
        </div>
      </div>

      {/* Expanded Requests List */}
      {isExpanded && (
        <div className="pl-6 space-y-0.5 border-l border-[rgb(var(--border))]/60 ml-3 py-1">
          {isLoading ? (
            <div className="text-[10px] text-[rgb(var(--muted-foreground))] py-1 px-2">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="text-[10px] text-[rgb(var(--muted-foreground))] py-1 px-2 italic">No requests in collection</div>
          ) : (
            requests.map((req) => {
              const isSelected = req.id === selectedRequestId;
              return (
                <div
                  key={req.id}
                  onClick={() => onSelectRequest(req.id, collection.id)}
                  className={`flex items-center justify-between group px-2 py-1 rounded-md text-xs cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-[rgb(var(--primary))]/15 font-semibold text-[rgb(var(--primary))]"
                      : "hover:bg-[rgb(var(--muted))]/40 text-[rgb(var(--foreground))]"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className={`font-mono text-[10px] font-bold w-9 ${getMethodColor(req.method)}`}>
                      {req.method}
                    </span>
                    <span className="truncate">{req.name}</span>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteReq.mutate(req.id, {
                        onSuccess: () => toast.success("Request deleted"),
                      });
                    }}
                  >
                    <Trash2 className="h-3 w-3 text-[rgb(var(--danger))]" />
                  </Button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

function ConfirmCollectionDeleteDialog({
  collection,
  workspaceId,
  open,
  onOpenChange,
}: {
  collection: Collection | null;
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const deleteCol = useDeleteCollection(workspaceId);
  const toast = useToast();

  if (!collection) return null;

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Collection"
      description={`Are you sure you want to delete "${collection.name}" and all its requests?`}
      confirmText="Delete Collection"
      variant="danger"
      onConfirm={() => {
        deleteCol.mutate(collection.id, {
          onSuccess: () => {
            toast.success("Collection deleted");
            onOpenChange(false);
          },
        });
      }}
    />
  );
}
