"use client";

import { Wrench, CheckCircle2, XCircle, AlertTriangle, Shield, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useConfirmAction, useRejectAction } from "../hooks/use-ai";
import { useToast } from "@/components/feedback/toast-system";
import type { AiAction, AiActionRisk } from "../types/ai.types";

interface AiToolCardProps {
  action: AiAction;
  sessionId: string;
}

export function AiToolCard({ action, sessionId }: AiToolCardProps) {
  const confirmMut = useConfirmAction(sessionId);
  const rejectMut = useRejectAction(sessionId);
  const toast = useToast();

  const handleConfirm = () => {
    confirmMut.mutate(action.id, {
      onSuccess: () => toast.success("AI Action confirmed & executed"),
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Failed to confirm action"),
    });
  };

  const handleReject = () => {
    rejectMut.mutate(action.id, {
      onSuccess: () => toast.success("AI Action rejected"),
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Failed to reject action"),
    });
  };

  const getRiskBadge = (risk: AiActionRisk) => {
    switch (risk) {
      case "LOW":
        return <Badge variant="success" className="text-[10px]">LOW RISK</Badge>;
      case "MEDIUM":
        return <Badge variant="info" className="text-[10px]">MEDIUM RISK</Badge>;
      case "HIGH":
        return <Badge variant="warning" className="text-[10px] gap-1"><AlertTriangle className="h-3 w-3" /> HIGH RISK</Badge>;
      case "CRITICAL":
        return <Badge variant="danger" className="text-[10px] gap-1"><Shield className="h-3 w-3" /> CRITICAL</Badge>;
      default:
        return <Badge variant="default" className="text-[10px]">{risk}</Badge>;
    }
  };

  const formatJson = (val?: string | null) => {
    if (!val) return null;
    try {
      return JSON.stringify(JSON.parse(val), null, 2);
    } catch {
      return val;
    }
  };

  return (
    <div className="p-3.5 border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--card))] space-y-3 text-xs my-2">
      {/* Tool Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-[rgb(var(--primary))]" />
          <span className="font-mono font-bold text-[rgb(var(--foreground))]">
            {action.toolName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {getRiskBadge(action.risk)}

          {action.status === "CONFIRMED" || action.status === "EXECUTED" ? (
            <Badge variant="success" className="text-[10px] gap-1">
              <CheckCircle2 className="h-3 w-3" /> Executed
            </Badge>
          ) : action.status === "REJECTED" ? (
            <Badge variant="danger" className="text-[10px] gap-1">
              <XCircle className="h-3 w-3" /> Rejected
            </Badge>
          ) : (
            <Badge variant="warning" className="text-[10px]">Pending Approval</Badge>
          )}
        </div>
      </div>

      {/* Input JSON Preview */}
      {action.inputJson && (
        <div className="space-y-1">
          <span className="text-[10px] text-[rgb(var(--muted-foreground))] font-semibold">
            Input Arguments:
          </span>
          <pre className="p-2 rounded bg-[rgb(var(--muted))/30] font-mono text-[11px] overflow-x-auto text-[rgb(var(--foreground))]">
            {formatJson(action.inputJson)}
          </pre>
        </div>
      )}

      {/* Output JSON Result if available */}
      {action.outputJson && (
        <div className="space-y-1">
          <span className="text-[10px] text-[rgb(var(--success))] font-semibold">
            Tool Output:
          </span>
          <pre className="p-2 rounded bg-[rgb(var(--success))/10] font-mono text-[11px] overflow-x-auto text-[rgb(var(--foreground))]">
            {formatJson(action.outputJson)}
          </pre>
        </div>
      )}

      {/* Error Message if failed */}
      {action.errorMessage && (
        <div className="p-2 rounded bg-[rgb(var(--danger))/10] text-[rgb(var(--danger))] font-mono text-[11px]">
          {action.errorMessage}
        </div>
      )}

      {/* Interactive Confirmation / Rejection Buttons */}
      {action.confirmationRequired && action.status === "PENDING" && (
        <div className="flex items-center justify-end gap-2 pt-1 border-t border-[rgb(var(--border))]">
          <span className="text-[11px] text-[rgb(var(--muted-foreground))] mr-auto">
            Requires human approval to execute
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleReject}
            disabled={rejectMut.isPending}
            className="h-7 text-xs gap-1"
          >
            <X className="h-3.5 w-3.5 text-[rgb(var(--danger))]" /> Reject
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            disabled={confirmMut.isPending}
            className="h-7 text-xs gap-1"
          >
            <Check className="h-3.5 w-3.5" /> Approve & Execute
          </Button>
        </div>
      )}
    </div>
  );
}
