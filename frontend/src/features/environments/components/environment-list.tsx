"use client";

import { useState } from "react";
import {
  Globe,
  Search,
  CheckCircle2,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  useEnvironments,
  useActivateEnvironment,
  useDeactivateEnvironment,
  useDeleteEnvironment,
} from "../hooks/use-environments";
import { CreateEnvironmentDialog } from "./create-environment-dialog";
import { EditEnvironmentDialog } from "./edit-environment-dialog";
import { EnvironmentVariableTable } from "./environment-variable-table";
import { useToast } from "@/components/feedback/toast-system";
import type { Environment } from "../types/environment.types";

interface EnvironmentListProps {
  workspaceId: string;
}

export function EnvironmentList({ workspaceId }: EnvironmentListProps) {
  const { data: environments = [], isLoading, error } = useEnvironments(workspaceId);
  const activateEnv = useActivateEnvironment(workspaceId);
  const deactivateEnv = useDeactivateEnvironment(workspaceId);
  const deleteEnv = useDeleteEnvironment(workspaceId);
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [expandedEnvId, setExpandedEnvId] = useState<string | null>(null);
  const [editingEnv, setEditingEnv] = useState<Environment | null>(null);

  const filteredEnvironments = environments.filter(
    (e) =>
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.description && e.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleToggleActive = (env: Environment) => {
    if (env.active) {
      deactivateEnv.mutate(env.id, {
        onSuccess: () => toast.success(`Deactivated ${env.name}`),
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Failed to deactivate environment"),
      });
    } else {
      activateEnv.mutate(env.id, {
        onSuccess: () => toast.success(`Activated ${env.name}`),
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Failed to activate environment"),
      });
    }
  };

  const handleDelete = (env: Environment) => {
    if (confirm(`Are you sure you want to delete environment "${env.name}"?`)) {
      deleteEnv.mutate(env.id, {
        onSuccess: () => toast.success("Environment deleted"),
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Failed to delete environment"),
      });
    }
  };

  const toggleExpand = (envId: string) => {
    setExpandedEnvId(expandedEnvId === envId ? null : envId);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgb(var(--border))] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-[rgb(var(--primary))]" />
            <h1 className="text-xl font-bold tracking-tight">Environments & Variables</h1>
          </div>
          <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
            Manage variables for base URLs, authentication tokens, and secrets across environments.
          </p>
        </div>

        <CreateEnvironmentDialog workspaceId={workspaceId} />
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-[rgb(var(--muted-foreground))]" />
        <Input
          placeholder="Search environments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 h-9 text-xs"
        />
      </div>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="p-8 text-center text-xs text-[rgb(var(--muted-foreground))]">
          Loading environments...
        </div>
      )}

      {error && (
        <div className="p-4 rounded-md bg-[rgb(var(--danger))/10] text-[rgb(var(--danger))] flex items-center gap-2 text-xs">
          <ShieldAlert className="h-4 w-4" />
          <span>Failed to load environments.</span>
        </div>
      )}

      {/* Environment List */}
      {!isLoading && !error && (
        <div className="space-y-3">
          {filteredEnvironments.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-[rgb(var(--border))] rounded-lg">
              <Globe className="h-8 w-8 mx-auto text-[rgb(var(--muted-foreground))] mb-2 opacity-50" />
              <p className="text-sm font-medium">No environments found</p>
              <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                Create an environment to store variables like base URLs or API keys.
              </p>
            </div>
          ) : (
            filteredEnvironments.map((env) => {
              const isExpanded = expandedEnvId === env.id;
              return (
                <div
                  key={env.id}
                  className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] overflow-hidden transition-colors"
                >
                  <div className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleExpand(env.id)}
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
                            onClick={() => toggleExpand(env.id)}
                            className="text-sm font-semibold cursor-pointer hover:text-[rgb(var(--primary))]"
                          >
                            {env.name}
                          </h3>
                          {env.active ? (
                            <Badge variant="success" className="text-[10px] py-0 px-1.5 gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="default" className="text-[10px] py-0 px-1.5">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        {env.description && (
                          <p className="text-xs text-[rgb(var(--muted-foreground))] mt-0.5">
                            {env.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleToggleActive(env)}
                        className="h-7 text-xs"
                      >
                        {env.active ? "Deactivate" : "Set Active"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingEnv(env)}
                        className="h-7 w-7 p-0"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(env)}
                        className="h-7 w-7 p-0 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--danger))]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Variables Table Accordion Content */}
                  {isExpanded && (
                    <div className="border-t border-[rgb(var(--border))] p-4 bg-[rgb(var(--muted))/20]">
                      <h4 className="text-xs font-semibold mb-3 text-[rgb(var(--muted-foreground))]">
                        Environment Variables
                      </h4>
                      <EnvironmentVariableTable environmentId={env.id} />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Edit Dialog */}
      <EditEnvironmentDialog
        workspaceId={workspaceId}
        environment={editingEnv}
        open={Boolean(editingEnv)}
        onOpenChange={(open) => {
          if (!open) setEditingEnv(null);
        }}
      />
    </div>
  );
}
