"use client";

import { useState } from "react";
import {
  History,
  Search,
  Filter,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useMyHistory, useDeleteExecution } from "../hooks/use-history";
import { HistoryDetailDrawer } from "./history-detail-drawer";
import { useToast } from "@/components/feedback/toast-system";
import type { ExecutionStatus } from "../types/history.types";

export function HistoryList() {
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [statusFilter, setStatusFilter] = useState<ExecutionStatus | "ALL">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExecutionId, setSelectedExecutionId] = useState<string | null>(null);

  const { data: pageData, isLoading, error } = useMyHistory(page, size, statusFilter);
  const deleteExecution = useDeleteExecution();
  const toast = useToast();

  const historyItems = pageData?.content || [];
  const totalPages = pageData?.totalPages || 1;

  const filteredItems = historyItems.filter((item) =>
    item.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.method.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteExecution.mutate(id, {
      onSuccess: () => toast.success("History record deleted"),
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Failed to delete record"),
    });
  };

  const getMethodBadgeClass = (m: string) => {
    switch (m.toUpperCase()) {
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

  const getStatusBadge = (status: ExecutionStatus, responseCode?: number | null) => {
    if (responseCode) {
      if (responseCode >= 200 && responseCode < 300) {
        return <Badge variant="success">{responseCode} OK</Badge>;
      }
      if (responseCode >= 400 && responseCode < 500) {
        return <Badge variant="warning">{responseCode} Client Err</Badge>;
      }
      return <Badge variant="danger">{responseCode} Error</Badge>;
    }

    switch (status) {
      case "SUCCESS":
        return <Badge variant="success">SUCCESS</Badge>;
      case "FAILED":
        return <Badge variant="danger">FAILED</Badge>;
      case "ERROR":
        return <Badge variant="danger">ERROR</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgb(var(--border))] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <History className="h-6 w-6 text-[rgb(var(--primary))]" />
            <h1 className="text-xl font-bold tracking-tight">Request Execution History</h1>
          </div>
          <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
            Audit logs and records of executed API requests, responses, latency, and payloads.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[rgb(var(--muted-foreground))]" />
          <Input
            placeholder="Search history by URL or method..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[rgb(var(--muted-foreground))]" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as ExecutionStatus | "ALL");
              setPage(0);
            }}
            className="h-9 px-3 text-xs rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--card))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="FAILED">FAILED</option>
            <option value="ERROR">ERROR</option>
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-md bg-[rgb(var(--danger))/10] text-[rgb(var(--danger))] flex items-center gap-2 text-xs">
          <ShieldAlert className="h-4 w-4" />
          <span>Failed to load request execution history.</span>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="p-8 text-center text-xs text-[rgb(var(--muted-foreground))]">
          Loading history audit logs...
        </div>
      )}

      {/* History Table */}
      {!isLoading && !error && (
        <div className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[rgb(var(--border))] bg-[rgb(var(--muted))/40] text-left text-[rgb(var(--muted-foreground))]">
                <th className="p-3 font-medium w-20">Method</th>
                <th className="p-3 font-medium">Request URL</th>
                <th className="p-3 font-medium w-28 text-center">Status</th>
                <th className="p-3 font-medium w-24 text-right">Latency</th>
                <th className="p-3 font-medium w-24 text-right">Size</th>
                <th className="p-3 font-medium w-36 text-right">Executed At</th>
                <th className="p-3 font-medium w-16 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--border))] font-mono">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center font-sans text-[rgb(var(--muted-foreground))]">
                    No request history entries found.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedExecutionId(item.id)}
                    className="hover:bg-[rgb(var(--accent))/30] cursor-pointer transition-colors"
                  >
                    <td className="p-3 font-sans">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${getMethodBadgeClass(
                          item.method
                        )}`}
                      >
                        {item.method}
                      </span>
                    </td>

                    <td className="p-3 max-w-xs sm:max-w-md truncate font-semibold text-[rgb(var(--foreground))]">
                      {item.url}
                    </td>

                    <td className="p-3 text-center font-sans">
                      {getStatusBadge(item.status, item.responseStatus)}
                    </td>

                    <td className="p-3 text-right text-[rgb(var(--muted-foreground))]">
                      {item.durationMs ? `${item.durationMs}ms` : "-"}
                    </td>

                    <td className="p-3 text-right text-[rgb(var(--muted-foreground))]">
                      {item.responseSizeBytes
                        ? `${(item.responseSizeBytes / 1024).toFixed(1)}KB`
                        : "-"}
                    </td>

                    <td className="p-3 text-right text-[rgb(var(--muted-foreground))] font-sans text-[11px]">
                      {new Date(item.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>

                    <td className="p-3 text-right font-sans">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDelete(e, item.id)}
                        className="h-7 w-7 p-0 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--danger))]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="p-3 border-t border-[rgb(var(--border))] flex items-center justify-between bg-[rgb(var(--muted))/20] text-xs">
              <span className="text-[rgb(var(--muted-foreground))]">
                Page {page + 1} of {totalPages}
              </span>

              <div className="flex items-center gap-1">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="h-7 px-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  className="h-7 px-2"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* History Item Drawer */}
      <HistoryDetailDrawer
        executionId={selectedExecutionId}
        open={Boolean(selectedExecutionId)}
        onOpenChange={(open) => {
          if (!open) setSelectedExecutionId(null);
        }}
      />
    </div>
  );
}
