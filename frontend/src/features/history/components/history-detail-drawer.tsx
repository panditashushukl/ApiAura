"use client";

import { useExecutionDetail } from "../hooks/use-history";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/feedback/loading-state";
import { Clock, Database, Globe, AlertCircle, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/feedback/toast-system";

interface HistoryDetailDrawerProps {
  executionId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HistoryDetailDrawer({
  executionId,
  open,
  onOpenChange,
}: HistoryDetailDrawerProps) {
  const { data: detail, isLoading, error } = useExecutionDetail(executionId);
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"response" | "request" | "headers">("response");

  const formatJson = (content?: string | null) => {
    if (!content) return "No body payload";
    try {
      return JSON.stringify(JSON.parse(content), null, 2);
    } catch {
      return content;
    }
  };

  const handleCopyBody = () => {
    if (detail?.responseBody) {
      navigator.clipboard.writeText(detail.responseBody);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusBadgeVariant = (status?: number | null) => {
    if (!status) return "default";
    if (status >= 200 && status < 300) return "success";
    if (status >= 300 && status < 400) return "warning";
    return "danger";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between pr-6 text-base font-semibold">
            <span className="truncate">Execution Audit Detail</span>
            {detail?.responseStatus && (
              <Badge variant={getStatusBadgeVariant(detail.responseStatus)}>
                {detail.responseStatus} Status
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {isLoading && <LoadingState message="Loading execution audit details..." />}

        {error && (
          <div className="p-4 text-xs text-[rgb(var(--danger))] flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>Failed to load execution details.</span>
          </div>
        )}

        {detail && !isLoading && (
          <div className="space-y-4 flex-1 overflow-y-auto pt-2 text-xs">
            {/* Summary Metadata Bar */}
            <div className="p-3 border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--card))] space-y-2">
              <div className="flex items-center gap-2 font-mono">
                <span className="font-bold px-2 py-0.5 rounded bg-[rgb(var(--muted))] text-[rgb(var(--primary))] text-[11px]">
                  {detail.method}
                </span>
                <span className="truncate text-[rgb(var(--foreground))] select-all">
                  {detail.url}
                </span>
              </div>

              <div className="flex items-center gap-4 text-[rgb(var(--muted-foreground))] pt-1 border-t border-[rgb(var(--border))] text-[11px]">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{detail.durationMs ?? 0} ms</span>
                </div>
                <div className="flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  <span>
                    {detail.responseSizeBytes
                      ? `${(detail.responseSizeBytes / 1024).toFixed(2)} KB`
                      : "0 KB"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  <span>{new Date(detail.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Error Message callout if any */}
            {detail.errorMessage && (
              <div className="p-3 rounded-lg border border-[rgb(var(--danger))/30] bg-[rgb(var(--danger))/10] text-[rgb(var(--danger))]">
                <p className="font-semibold mb-1">Execution Error:</p>
                <p className="font-mono">{detail.errorMessage}</p>
              </div>
            )}

            {/* Tabs for Response Body, Request Body, and Headers */}
            <div className="border border-[rgb(var(--border))] rounded-lg overflow-hidden bg-[rgb(var(--card))]">
              <div className="flex border-b border-[rgb(var(--border))] bg-[rgb(var(--muted))/30] font-medium">
                <button
                  type="button"
                  onClick={() => setActiveTab("response")}
                  className={`px-4 py-2 border-b-2 transition-colors ${
                    activeTab === "response"
                      ? "border-[rgb(var(--primary))] text-[rgb(var(--primary))]"
                      : "border-transparent text-[rgb(var(--muted-foreground))]"
                  }`}
                >
                  Response Body
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("request")}
                  className={`px-4 py-2 border-b-2 transition-colors ${
                    activeTab === "request"
                      ? "border-[rgb(var(--primary))] text-[rgb(var(--primary))]"
                      : "border-transparent text-[rgb(var(--muted-foreground))]"
                  }`}
                >
                  Request Body
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("headers")}
                  className={`px-4 py-2 border-b-2 transition-colors ${
                    activeTab === "headers"
                      ? "border-[rgb(var(--primary))] text-[rgb(var(--primary))]"
                      : "border-transparent text-[rgb(var(--muted-foreground))]"
                  }`}
                >
                  Headers
                </button>
              </div>

              <div className="p-3 relative">
                {activeTab === "response" && (
                  <>
                    <button
                      type="button"
                      onClick={handleCopyBody}
                      className="absolute right-4 top-4 p-1 rounded bg-[rgb(var(--muted))] hover:bg-[rgb(var(--accent))] text-[rgb(var(--muted-foreground))]"
                      title="Copy response body"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-[rgb(var(--success))]" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    <pre className="font-mono text-[11px] p-3 rounded bg-[rgb(var(--background))] overflow-x-auto max-h-[260px] text-[rgb(var(--foreground))]">
                      {formatJson(detail.responseBody)}
                    </pre>
                  </>
                )}

                {activeTab === "request" && (
                  <pre className="font-mono text-[11px] p-3 rounded bg-[rgb(var(--background))] overflow-x-auto max-h-[260px] text-[rgb(var(--foreground))]">
                    {formatJson(detail.requestBody)}
                  </pre>
                )}

                {activeTab === "headers" && (
                  <div className="space-y-3 font-mono text-[11px]">
                    <div>
                      <h4 className="font-bold text-[rgb(var(--muted-foreground))] mb-1 font-sans">
                        Response Headers
                      </h4>
                      <pre className="p-2.5 rounded bg-[rgb(var(--background))] overflow-x-auto">
                        {formatJson(detail.responseHeaders)}
                      </pre>
                    </div>

                    <div>
                      <h4 className="font-bold text-[rgb(var(--muted-foreground))] mb-1 font-sans">
                        Request Headers
                      </h4>
                      <pre className="p-2.5 rounded bg-[rgb(var(--background))] overflow-x-auto">
                        {formatJson(detail.requestHeaders)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
