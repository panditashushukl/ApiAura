"use client";

import { useState } from "react";
import {
  GitFork,
  Search,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  ChevronDown,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useWorkflows, useExecuteWorkflow } from "../hooks/use-workflows";
import { CreateWorkflowDialog } from "./create-workflow-dialog";
import { WorkflowStepBuilder } from "./workflow-step-builder";
import { EnvironmentSelector } from "@/features/environments/components/environment-selector";
import { useToast } from "@/components/feedback/toast-system";
import type { WorkflowExecutionResponse, WorkflowStep } from "../types/workflow.types";

interface WorkflowListProps {
  workspaceId: string;
}

export function WorkflowList({ workspaceId }: WorkflowListProps) {
  const { data: workflows = [], isLoading, error } = useWorkflows(workspaceId);
  const executeWorkflow = useExecuteWorkflow();
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEnvId, setSelectedEnvId] = useState<string | null>(null);
  const [expandedWorkflowId, setExpandedWorkflowId] = useState<string | null>(null);
  const [workflowLogs, setWorkflowLogs] = useState<Record<string, WorkflowExecutionResponse>>({});
  const [workflowSteps, setWorkflowSteps] = useState<Record<string, WorkflowStep[]>>({});

  const filteredWorkflows = workflows.filter(
    (w) =>
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.description && w.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleRunWorkflow = (workflowId: string) => {
    executeWorkflow.mutate(
      { workflowId, environmentId: selectedEnvId || undefined },
      {
        onSuccess: (res) => {
          setWorkflowLogs((prev) => ({ ...prev, [workflowId]: res }));
          toast.success("Workflow execution finished");
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Workflow execution failed");
        },
      }
    );
  };

  const toggleExpand = (wfId: string) => {
    setExpandedWorkflowId(expandedWorkflowId === wfId ? null : wfId);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgb(var(--border))] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <GitFork className="h-6 w-6 text-[rgb(var(--primary))]" />
            <h1 className="text-xl font-bold tracking-tight">Workflow Automation</h1>
          </div>
          <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
            Build multi-step API execution chains, extract JSON variables, and automate complex workflows.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <EnvironmentSelector
            workspaceId={workspaceId}
            selectedEnvironmentId={selectedEnvId}
            onSelectEnvironment={(env) => setSelectedEnvId(env?.id || null)}
          />
          <CreateWorkflowDialog workspaceId={workspaceId} />
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-[rgb(var(--muted-foreground))]" />
        <Input
          placeholder="Search workflows by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 h-9 text-xs"
        />
      </div>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="p-8 text-center text-xs text-[rgb(var(--muted-foreground))]">
          Loading workflow automation pipelines...
        </div>
      )}

      {error && (
        <div className="p-4 rounded-md bg-[rgb(var(--danger))/10] text-[rgb(var(--danger))] flex items-center gap-2 text-xs">
          <ShieldAlert className="h-4 w-4" />
          <span>Failed to load workflows.</span>
        </div>
      )}

      {/* Workflows Card List */}
      {!isLoading && !error && (
        <div className="space-y-4">
          {filteredWorkflows.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-[rgb(var(--border))] rounded-lg">
              <GitFork className="h-8 w-8 mx-auto text-[rgb(var(--muted-foreground))] mb-2 opacity-50" />
              <p className="text-sm font-medium">No workflow pipelines configured</p>
              <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                Create a multi-step workflow to sequence API execution steps and pass dynamic variables between requests.
              </p>
            </div>
          ) : (
            filteredWorkflows.map((wf) => {
              const isExpanded = expandedWorkflowId === wf.id;
              const lastLog = workflowLogs[wf.id];
              const steps = workflowSteps[wf.id] || wf.steps || [];

              return (
                <div
                  key={wf.id}
                  className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] overflow-hidden transition-colors"
                >
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleExpand(wf.id)}
                        className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3
                            onClick={() => toggleExpand(wf.id)}
                            className="text-base font-semibold cursor-pointer hover:text-[rgb(var(--primary))]"
                          >
                            {wf.name}
                          </h3>
                          {lastLog && (
                            <Badge
                              variant={lastLog.status === "COMPLETED" ? "success" : "danger"}
                              className="text-[10px] gap-1"
                            >
                              {lastLog.status === "COMPLETED" ? (
                                <CheckCircle2 className="h-3 w-3" />
                              ) : (
                                <XCircle className="h-3 w-3" />
                              )}
                              {lastLog.status}
                            </Badge>
                          )}
                        </div>
                        {wf.description && (
                          <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                            {wf.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={() => handleRunWorkflow(wf.id)}
                      disabled={executeWorkflow.isPending}
                      className="gap-2 text-xs"
                    >
                      <Play className="h-3.5 w-3.5" />
                      {executeWorkflow.isPending ? "Running Workflow..." : "Execute Workflow"}
                    </Button>
                  </div>

                  {/* Execution Progress & Metrics */}
                  {lastLog && (
                    <div className="border-t border-[rgb(var(--border))] p-3.5 bg-[rgb(var(--muted))/20] flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-4">
                        <span>Total Steps: {lastLog.totalSteps}</span>
                        <span className="text-[rgb(var(--success))]">
                          Completed: {lastLog.completedSteps}
                        </span>
                        <span className="text-[rgb(var(--danger))]">
                          Failed: {lastLog.failedSteps}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[rgb(var(--muted-foreground))]">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{lastLog.durationMs} ms</span>
                      </div>
                    </div>
                  )}

                  {/* Expanded Step Sequence Accordion */}
                  {isExpanded && (
                    <div className="border-t border-[rgb(var(--border))] p-5 bg-[rgb(var(--muted))/10] space-y-3">
                      <h4 className="text-xs font-semibold text-[rgb(var(--muted-foreground))]">
                        Workflow Step Sequence & Variable Extraction Map
                      </h4>
                      <WorkflowStepBuilder
                        steps={steps}
                        onChangeSteps={(updatedSteps) =>
                          setWorkflowSteps((prev) => ({ ...prev, [wf.id]: updatedSteps }))
                        }
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
