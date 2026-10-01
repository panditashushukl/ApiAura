"use client";

import { useState } from "react";
import {
  ShieldAlert,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Shield,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWorkspaceAuditLogs } from "../hooks/use-audit";

interface AuditLogListProps {
  workspaceId: string;
}

export function AuditLogList({ workspaceId }: AuditLogListProps) {
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const { data: pageData, isLoading, error } = useWorkspaceAuditLogs(
    workspaceId,
    page,
    size
  );

  const logs = pageData?.content || [];
  const totalPages = pageData?.totalPages || 1;

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.resourceType && log.resourceType.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.ipAddress && log.ipAddress.includes(searchTerm)) ||
      (log.user?.email && log.user.email.toLowerCase().includes(searchTerm.toLowerCase()));

    if (selectedCategory === "ALL") return matchesSearch;
    return matchesSearch && log.action.toUpperCase().includes(selectedCategory);
  });

  const getActionBadge = (action: string) => {
    const actUpper = action.toUpperCase();
    if (actUpper.includes("CREATE") || actUpper.includes("ADD")) {
      return <Badge variant="success">{action}</Badge>;
    }
    if (actUpper.includes("UPDATE") || actUpper.includes("EDIT")) {
      return <Badge variant="info">{action}</Badge>;
    }
    if (actUpper.includes("DELETE") || actUpper.includes("REMOVE")) {
      return <Badge variant="danger">{action}</Badge>;
    }
    if (actUpper.includes("AUTH") || actUpper.includes("LOGIN")) {
      return <Badge variant="warning">{action}</Badge>;
    }
    return <Badge variant="default">{action}</Badge>;
  };

  const formatMetadata = (meta?: string | null) => {
    if (!meta) return null;
    try {
      return JSON.stringify(JSON.parse(meta), null, 2);
    } catch {
      return meta;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgb(var(--border))] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-[rgb(var(--primary))]" />
            <h1 className="text-xl font-bold tracking-tight">Security Audit Trail</h1>
          </div>
          <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
            Immutable audit records of workspace actions, authentication events, and administrative changes.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[rgb(var(--muted-foreground))]" />
          <Input
            placeholder="Search audit logs by user, action, or IP address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[rgb(var(--muted-foreground))]" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-9 px-3 text-xs rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--card))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]"
          >
            <option value="ALL">All Categories</option>
            <option value="USER">User Management</option>
            <option value="AUTH">Authentication</option>
            <option value="WORKSPACE">Workspace</option>
            <option value="COLLECTION">Collection</option>
            <option value="REQUEST">Request Execution</option>
          </select>
        </div>
      </div>

      {/* Error & Loading States */}
      {error && (
        <div className="p-4 rounded-md bg-[rgb(var(--danger))/10] text-[rgb(var(--danger))] flex items-center gap-2 text-xs">
          <ShieldAlert className="h-4 w-4" />
          <span>Failed to load security audit logs.</span>
        </div>
      )}

      {isLoading && (
        <div className="p-8 text-center text-xs text-[rgb(var(--muted-foreground))]">
          Loading audit trail records...
        </div>
      )}

      {/* Audit Log Table */}
      {!isLoading && !error && (
        <div className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[rgb(var(--border))] bg-[rgb(var(--muted))/40] text-left text-[rgb(var(--muted-foreground))]">
                <th className="p-3 font-medium w-44">Action Event</th>
                <th className="p-3 font-medium">Actor User</th>
                <th className="p-3 font-medium">Resource</th>
                <th className="p-3 font-medium w-32">IP Address</th>
                <th className="p-3 font-medium w-36 text-right">Timestamp</th>
                <th className="p-3 font-medium w-12 text-center">Meta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--border))]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[rgb(var(--muted-foreground))]">
                    No security audit log events recorded yet.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  return (
                    <tr key={log.id} className="hover:bg-[rgb(var(--accent))/30] transition-colors">
                      <td className="p-3">{getActionBadge(log.action)}</td>

                      <td className="p-3 font-medium text-[rgb(var(--foreground))]">
                        {log.user?.fullName || log.user?.email || "System / Service"}
                      </td>

                      <td className="p-3 font-mono text-[11px] text-[rgb(var(--muted-foreground))]">
                        {log.resourceType ? (
                          <span>
                            {log.resourceType}{" "}
                            {log.resourceId && <span className="opacity-60">({String(log.resourceId).slice(0, 8)})</span>}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td className="p-3 font-mono text-[11px] text-[rgb(var(--muted-foreground))]">
                        {log.ipAddress || "127.0.0.1"}
                      </td>

                      <td className="p-3 text-right font-mono text-[11px] text-[rgb(var(--muted-foreground))]">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>

                      <td className="p-3 text-center">
                        {log.metadata ? (
                          <button
                            type="button"
                            onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                            className="p-1 rounded text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
                            title="Toggle metadata detail"
                          >
                            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          </button>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Expanded Metadata Sub-row preview */}
          {expandedLogId && (
            <div className="p-4 border-t border-[rgb(var(--border))] bg-[rgb(var(--muted))/20] text-xs space-y-1">
              <span className="font-semibold text-[rgb(var(--muted-foreground))] font-mono">
                Audit Event Metadata payload (Log #{expandedLogId.slice(0, 8)}):
              </span>
              <pre className="p-3 rounded bg-[rgb(var(--card))] border border-[rgb(var(--border))] font-mono text-[11px] overflow-x-auto text-[rgb(var(--foreground))]">
                {formatMetadata(logs.find((l) => l.id === expandedLogId)?.metadata)}
              </pre>
            </div>
          )}

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
    </div>
  );
}
