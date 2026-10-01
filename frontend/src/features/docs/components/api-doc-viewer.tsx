"use client";

import { useState } from "react";
import { BookOpen, Globe, Copy, Check, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCollection } from "@/features/collections/hooks/use-collections";
import { useCollectionRequests } from "@/features/requests/hooks/use-requests";
import { CodeSnippetGenerator } from "./code-snippet-generator";
import { LoadingState } from "@/components/feedback/loading-state";
import { useToast } from "@/components/feedback/toast-system";

interface ApiDocViewerProps {
  collectionId: string;
}

export function ApiDocViewer({ collectionId }: ApiDocViewerProps) {
  const toast = useToast();
  const { data: collection, isLoading: loadingCol } = useCollection(collectionId);
  const { data: requests = [], isLoading: loadingReqs } = useCollectionRequests(collectionId);
  const [copiedBaseUrl, setCopiedBaseUrl] = useState(false);

  const handleCopyBaseUrl = () => {
    const url = collection?.baseUrl || "https://api.example.com";
    navigator.clipboard.writeText(url);
    setCopiedBaseUrl(true);
    toast.success("Base URL copied");
    setTimeout(() => setCopiedBaseUrl(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const getMethodBadgeClass = (method: string) => {
    switch (method.toUpperCase()) {
      case "GET":
        return "text-[rgb(var(--success))] bg-[rgb(var(--success))]/10 border-[rgb(var(--success))]/30";
      case "POST":
        return "text-[rgb(var(--warning))] bg-[rgb(var(--warning))]/10 border-[rgb(var(--warning))]/30";
      case "PUT":
        return "text-[rgb(var(--info))] bg-[rgb(var(--info))]/10 border-[rgb(var(--info))]/30";
      case "DELETE":
        return "text-[rgb(var(--danger))] bg-[rgb(var(--danger))]/10 border-[rgb(var(--danger))]/30";
      default:
        return "text-[rgb(var(--foreground))] bg-[rgb(var(--muted))] border-[rgb(var(--border))]";
    }
  };

  if (loadingCol || loadingReqs) {
    return <LoadingState message="Generating API documentation..." />;
  }

  if (!collection) {
    return <div className="p-6 text-[rgb(var(--danger))]">Collection not found.</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgb(var(--border))] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-[rgb(var(--primary))]" />
            <h1 className="text-2xl font-bold tracking-tight">{collection.name}</h1>
          </div>
          {collection.description && (
            <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
              {collection.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handlePrint} className="gap-1.5 text-xs">
            <Printer className="h-3.5 w-3.5" /> Export PDF / Print
          </Button>
        </div>
      </div>

      {/* Base URL Box */}
      <div className="p-4 border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--card))] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 font-mono">
          <Globe className="h-4 w-4 text-[rgb(var(--primary))]" />
          <span className="font-semibold text-[rgb(var(--muted-foreground))]">Base URL:</span>
          <span className="font-bold text-[rgb(var(--foreground))]">
            {collection.baseUrl || "https://api.example.com/v1"}
          </span>
        </div>

        <Button variant="ghost" size="sm" onClick={handleCopyBaseUrl} className="h-7 gap-1 text-xs">
          {copiedBaseUrl ? <Check className="h-3.5 w-3.5 text-[rgb(var(--success))]" /> : <Copy className="h-3.5 w-3.5" />}
          Copy Base URL
        </Button>
      </div>

      {/* Split TOC & Documentation Body */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* TOC Sidebar */}
        <div className="md:col-span-1 border border-[rgb(var(--border))] rounded-lg p-4 bg-[rgb(var(--card))] space-y-3 sticky top-6 h-fit text-xs">
          <h3 className="font-bold text-[rgb(var(--muted-foreground))] uppercase tracking-wider text-[10px]">
            Endpoints ({requests.length})
          </h3>
          <nav className="space-y-1">
            {requests.map((req) => (
              <a
                key={req.id}
                href={`#endpoint-${req.id}`}
                className="flex items-center gap-2 p-1.5 rounded hover:bg-[rgb(var(--accent))] transition-colors text-[rgb(var(--foreground))] truncate"
              >
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${getMethodBadgeClass(req.method)}`}>
                  {req.method}
                </span>
                <span className="truncate font-medium">{req.name}</span>
              </a>
            ))}
          </nav>
        </div>

        {/* Documentation Content Area */}
        <div className="md:col-span-3 space-y-8">
          {requests.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-[rgb(var(--border))] rounded-lg">
              <BookOpen className="h-8 w-8 mx-auto text-[rgb(var(--muted-foreground))] mb-2 opacity-50" />
              <p className="text-sm font-medium">No API requests in this collection</p>
              <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                Add requests to this collection to automatically generate interactive API documentation.
              </p>
            </div>
          ) : (
            requests.map((req) => (
              <div
                key={req.id}
                id={`endpoint-${req.id}`}
                className="p-5 border border-[rgb(var(--border))] rounded-xl bg-[rgb(var(--card))] space-y-5 scroll-mt-6"
              >
                {/* Endpoint Header */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md border font-mono ${getMethodBadgeClass(req.method)}`}>
                      {req.method}
                    </span>
                    <h2 className="text-lg font-bold tracking-tight">{req.name}</h2>
                  </div>

                  <div className="p-2.5 rounded-md bg-[rgb(var(--muted))/30] font-mono text-xs text-[rgb(var(--foreground))] border border-[rgb(var(--border))] select-all">
                    {req.url}
                  </div>

                  {req.description && (
                    <p className="text-xs text-[rgb(var(--muted-foreground))] pt-1">
                      {req.description}
                    </p>
                  )}
                </div>

                {/* Request Body JSON Preview */}
                {req.body && req.bodyType !== "NONE" && (
                  <div className="space-y-2 text-xs">
                    <h4 className="font-semibold text-[rgb(var(--foreground))]">
                      Request Body ({req.bodyType})
                    </h4>
                    <pre className="p-3 rounded-md bg-[rgb(var(--background))] border border-[rgb(var(--border))] font-mono text-[11px] overflow-x-auto text-[rgb(var(--foreground))] max-h-[220px]">
                      {req.body}
                    </pre>
                  </div>
                )}

                {/* Code Snippet Generator Widget */}
                <CodeSnippetGenerator
                  method={req.method}
                  url={req.url}
                  body={req.body}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
