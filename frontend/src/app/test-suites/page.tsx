"use client";

import { useState } from "react";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { useTestSuites, useExecuteTestSuite } from "@/features/testing/hooks/use-testing";
import { EnvironmentSelector } from "@/features/environments/components/environment-selector";
import { LoadingState } from "@/components/feedback/loading-state";
import { useToast } from "@/components/feedback/toast-system";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TestTube2,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
} from "lucide-react";
import Link from "next/link";
import type { TestExecutionResponse } from "@/features/testing/types/testing.types";

export default function TestSuitesPage() {
  const { selectedWorkspaceId } = useWorkspaceStore();
  const { data: testSuites = [], isLoading } = useTestSuites(selectedWorkspaceId);
  const executeSuite = useExecuteTestSuite();
  const toast = useToast();

  const [selectedEnvId, setSelectedEnvId] = useState<string | null>(null);
  const [executionLogs, setExecutionLogs] = useState<Record<string, TestExecutionResponse>>({});

  const handleRunSuite = (suiteId: string) => {
    executeSuite.mutate(
      { testSuiteId: suiteId, environmentId: selectedEnvId || undefined },
      {
        onSuccess: (res) => {
          setExecutionLogs((prev) => ({ ...prev, [suiteId]: res }));
          toast.success("Test suite executed successfully");
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Test suite execution failed");
        },
      }
    );
  };

  if (isLoading) return <LoadingState message="Loading test suites..." />;

  if (!selectedWorkspaceId) {
    return (
      <div className="p-12 text-center max-w-md mx-auto space-y-4">
        <Layers className="h-10 w-10 mx-auto text-[rgb(var(--muted-foreground))]" />
        <h2 className="text-lg font-semibold">No Workspace Selected</h2>
        <p className="text-xs text-[rgb(var(--muted-foreground))]">
          Please select or create a workspace to manage automated test suites.
        </p>
        <Link href="/workspaces">
          <Button size="sm">Go to Workspaces</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgb(var(--border))] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <TestTube2 className="h-6 w-6 text-[rgb(var(--primary))]" />
            <h1 className="text-xl font-bold tracking-tight">Automated Test Suites</h1>
          </div>
          <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
            Run automated integration tests, assertion verification, and collection regression suites.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[rgb(var(--muted-foreground))] font-medium">Environment:</span>
          <EnvironmentSelector
            workspaceId={selectedWorkspaceId}
            selectedEnvironmentId={selectedEnvId}
            onSelectEnvironment={(env) => setSelectedEnvId(env?.id || null)}
          />
        </div>
      </div>

      {/* Test Suites List */}
      <div className="space-y-4">
        {testSuites.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-[rgb(var(--border))] rounded-lg">
            <TestTube2 className="h-8 w-8 mx-auto text-[rgb(var(--muted-foreground))] mb-2 opacity-50" />
            <p className="text-sm font-medium">No test suites configured</p>
            <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
              Add assertions in Request Builder or create collection test suites to automate API validation.
            </p>
          </div>
        ) : (
          testSuites.map((suite) => {
            const lastLog = executionLogs[suite.id];
            return (
              <div
                key={suite.id}
                className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] overflow-hidden"
              >
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold">{suite.name}</h3>
                      {lastLog && (
                        <Badge
                          variant={lastLog.status === "PASSED" ? "success" : "danger"}
                          className="text-[10px] gap-1"
                        >
                          {lastLog.status === "PASSED" ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          {lastLog.status}
                        </Badge>
                      )}
                    </div>
                    {suite.description && (
                      <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                        {suite.description}
                      </p>
                    )}
                  </div>

                  <Button
                    onClick={() => handleRunSuite(suite.id)}
                    disabled={executeSuite.isPending}
                    className="gap-2 text-xs"
                  >
                    <Play className="h-3.5 w-3.5" />
                    {executeSuite.isPending ? "Running..." : "Run Test Suite"}
                  </Button>
                </div>

                {/* Execution Log summary if available */}
                {lastLog && (
                  <div className="border-t border-[rgb(var(--border))] p-4 bg-[rgb(var(--muted))/20] flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-4">
                      <span>Total: {lastLog.totalTests}</span>
                      <span className="text-[rgb(var(--success))]">Passed: {lastLog.passedTests}</span>
                      <span className="text-[rgb(var(--danger))]">Failed: {lastLog.failedTests}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[rgb(var(--muted-foreground))]">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{lastLog.durationMs} ms</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
