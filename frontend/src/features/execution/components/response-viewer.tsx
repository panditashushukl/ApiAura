"use client";

import { useMemo, useState } from "react";
import { Copy, Check, Search, Code, AlignLeft, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiExecutionResponse } from "../types/execution.types";
import { useToast } from "@/components/feedback/toast-system";

interface ResponseViewerProps {
  execution: ApiExecutionResponse | null;
  isLoading?: boolean;
}

export function ResponseViewer({ execution, isLoading }: ResponseViewerProps) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"body" | "headers" | "tests">("body");
  const [viewMode, setViewMode] = useState<"pretty" | "raw">("pretty");
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState("");

  const formattedJson = useMemo(() => {
    if (!execution?.responseBody) return "";
    try {
      const parsed = JSON.parse(execution.responseBody);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return execution.responseBody;
    }
  }, [execution]);

  const parsedHeaders = useMemo(() => {
    if (!execution?.responseHeaders) return [];
    try {
      const parsed = JSON.parse(execution.responseHeaders);
      if (typeof parsed === "object" && parsed !== null) {
        return Object.entries(parsed).map(([key, value]) => ({
          key,
          value: String(value),
        }));
      }
    } catch {
      // Fallback format line by line
      return execution.responseHeaders.split("\n").map((line) => {
        const [k, ...v] = line.split(":");
        return { key: k?.trim() || "", value: v.join(":")?.trim() || "" };
      }).filter((item) => item.key);
    }
    return [];
  }, [execution]);


  const filteredBody = useMemo(() => {
    const text = viewMode === "pretty" ? formattedJson : (execution?.responseBody || "");
    if (!search.trim()) return text;
    return text;
  }, [formattedJson, execution?.responseBody, viewMode, search]);

  const handleCopy = () => {
    if (!execution?.responseBody) return;
    navigator.clipboard.writeText(formattedJson);
    setCopied(true);
    toast.success("Response copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusVariant = (code?: number | null) => {
    if (!code) return "danger";
    if (code >= 200 && code < 300) return "success";
    if (code >= 300 && code < 400) return "info";
    if (code >= 400 && code < 500) return "warning";
    return "danger";
  };

  const formatBytes = (bytes?: number | null) => {
    if (!bytes) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(2)} KB`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[250px] p-6 text-[rgb(var(--muted-foreground))]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[rgb(var(--primary))] border-t-transparent mb-3" />
        <p className="text-xs font-medium">Executing API request...</p>
      </div>
    );
  }

  if (!execution) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[250px] p-6 text-center text-[rgb(var(--muted-foreground))]">
        <Code className="h-10 w-10 text-[rgb(var(--muted-foreground))]/40 mb-2" />
        <p className="text-sm font-medium">No Response Available</p>
        <p className="text-xs mt-1">Click &quot;Send&quot; to execute this request and view response payloads.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--card))] overflow-hidden">
      {/* Response Header Metrics Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-[rgb(var(--border))] px-4 py-2.5 bg-[rgb(var(--muted))]/40 gap-3">
        <div className="flex items-center gap-3">
          <Badge variant={getStatusVariant(execution.responseStatus)}>
            {execution.responseStatus || execution.status}
          </Badge>

          <span className="text-xs font-mono text-[rgb(var(--muted-foreground))]">
            Time: <strong className="text-[rgb(var(--foreground))]">{execution.durationMs ?? 0} ms</strong>
          </span>

          <span className="text-xs font-mono text-[rgb(var(--muted-foreground))]">
            Size: <strong className="text-[rgb(var(--foreground))]">{formatBytes(execution.responseSizeBytes)}</strong>
          </span>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1 bg-[rgb(var(--background))] p-0.5 rounded-md border border-[rgb(var(--border))]">
          <button
            onClick={() => setActiveTab("body")}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              activeTab === "body" ? "bg-[rgb(var(--primary))] text-white" : "text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
            }`}
          >
            Body
          </button>
          <button
            onClick={() => setActiveTab("headers")}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              activeTab === "headers" ? "bg-[rgb(var(--primary))] text-white" : "text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
            }`}
          >
            Headers ({parsedHeaders.length})
          </button>
        </div>
      </div>

      {/* Error Message Display if any */}
      {execution.errorMessage && (
        <div className="p-3 bg-[rgb(var(--danger))]/10 border-b border-[rgb(var(--danger))]/20 flex items-start gap-2 text-xs text-[rgb(var(--danger))]">
          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{execution.errorMessage}</span>
        </div>
      )}

      {/* Body Tab */}
      {activeTab === "body" && (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Sub-toolbar */}
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-[rgb(var(--border))] text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("pretty")}
                className={`flex items-center gap-1 px-2 py-0.5 rounded ${
                  viewMode === "pretty" ? "bg-[rgb(var(--muted))] text-[rgb(var(--foreground))]" : "text-[rgb(var(--muted-foreground))]"
                }`}
              >
                <Code className="h-3.5 w-3.5" /> Pretty
              </button>
              <button
                onClick={() => setViewMode("raw")}
                className={`flex items-center gap-1 px-2 py-0.5 rounded ${
                  viewMode === "raw" ? "bg-[rgb(var(--muted))] text-[rgb(var(--foreground))]" : "text-[rgb(var(--muted-foreground))]"
                }`}
              >
                <AlignLeft className="h-3.5 w-3.5" /> Raw
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-[rgb(var(--muted-foreground))]" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Find in response..."
                  className="h-7 text-xs pl-7 w-40"
                />
              </div>

              <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 px-2 text-xs gap-1">
                {copied ? <Check className="h-3.5 w-3.5 text-[rgb(var(--success))]" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>

          {/* Response Payload Content */}
          <div className="flex-1 p-3 overflow-auto bg-[rgb(var(--background))] text-xs font-mono">
            <pre className="whitespace-pre-wrap break-all text-[rgb(var(--foreground))]">
              {filteredBody || "(Empty response body)"}
            </pre>
          </div>
        </div>
      )}

      {/* Headers Tab */}
      {activeTab === "headers" && (
        <div className="flex-1 overflow-auto p-3">
          {parsedHeaders.length === 0 ? (
            <p className="text-xs text-[rgb(var(--muted-foreground))] p-4 text-center">No response headers recorded.</p>
          ) : (
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-[rgb(var(--border))] text-left text-[rgb(var(--muted-foreground))]">
                  <th className="py-2 px-3 font-medium">Header Key</th>
                  <th className="py-2 px-3 font-medium">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--border))]">
                {parsedHeaders.map((header, idx) => (
                  <tr key={idx} className="hover:bg-[rgb(var(--muted))]/20">
                    <td className="py-2 px-3 text-[rgb(var(--primary))] font-semibold">{header.key}</td>
                    <td className="py-2 px-3 text-[rgb(var(--foreground))] break-all">{header.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
