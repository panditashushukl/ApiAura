"use client";

import { useState } from "react";
import { Eye, EyeOff, Plus, Trash2, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/feedback/toast-system";
import {
  useEnvironmentVariables,
  useCreateEnvironmentVariable,
  useUpdateEnvironmentVariable,
  useDeleteEnvironmentVariable,
} from "../hooks/use-environment-variables";
import type { EnvironmentVariable } from "../types/environment.types";

interface EnvironmentVariableTableProps {
  environmentId: string;
}

export function EnvironmentVariableTable({ environmentId }: EnvironmentVariableTableProps) {
  const { data: variables = [], isLoading } = useEnvironmentVariables(environmentId);
  const createVar = useCreateEnvironmentVariable(environmentId);
  const updateVar = useUpdateEnvironmentVariable(environmentId);
  const deleteVar = useDeleteEnvironmentVariable(environmentId);
  const toast = useToast();

  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [isSecret, setIsSecret] = useState(false);
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});

  const handleToggleReveal = (varId: string) => {
    setRevealedSecrets((prev) => ({ ...prev, [varId]: !prev[varId] }));
  };

  const handleAddVariable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) {
      toast.error("Variable key is required");
      return;
    }

    createVar.mutate(
      {
        variableKey: newKey.trim(),
        variableValue: isSecret ? undefined : newValue,
        secretValue: isSecret ? newValue : undefined,
        secret: isSecret,
        enabled: true,
      },
      {
        onSuccess: () => {
          toast.success("Variable added");
          setNewKey("");
          setNewValue("");
          setIsSecret(false);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Failed to add variable");
        },
      }
    );
  };

  const handleToggleEnabled = (v: EnvironmentVariable) => {
    updateVar.mutate(
      {
        variableId: v.id,
        request: { enabled: !v.enabled },
      },
      {
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Failed to update variable");
        },
      }
    );
  };

  const handleToggleSecret = (v: EnvironmentVariable) => {
    updateVar.mutate(
      {
        variableId: v.id,
        request: { secret: !v.secret },
      },
      {
        onSuccess: () => {
          toast.success(v.secret ? "Marked as plain text" : "Marked as secret");
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Failed to update variable");
        },
      }
    );
  };

  const handleDeleteVariable = (varId: string) => {
    deleteVar.mutate(varId, {
      onSuccess: () => toast.success("Variable deleted"),
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Failed to delete variable"),
    });
  };

  if (isLoading) {
    return <div className="p-4 text-xs text-[rgb(var(--muted-foreground))]">Loading variables...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-[rgb(var(--border))] overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[rgb(var(--border))] bg-[rgb(var(--muted))/50]">
              <th className="p-2.5 text-left w-10 font-medium">State</th>
              <th className="p-2.5 text-left font-medium">Variable Key</th>
              <th className="p-2.5 text-left font-medium">Value</th>
              <th className="p-2.5 text-center w-20 font-medium">Type</th>
              <th className="p-2.5 text-right w-20 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgb(var(--border))]">
            {variables.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-[rgb(var(--muted-foreground))]">
                  No variables defined in this environment yet.
                </td>
              </tr>
            ) : (
              variables.map((v) => {
                const isRevealed = revealedSecrets[v.id];
                return (
                  <tr key={v.id} className="hover:bg-[rgb(var(--accent))/30]">
                    <td className="p-2.5 text-center">
                      <Checkbox
                        checked={v.enabled}
                        onCheckedChange={() => handleToggleEnabled(v)}
                      />
                    </td>
                    <td className="p-2.5 font-mono text-[rgb(var(--primary))] font-semibold">
                      {v.variableKey}
                    </td>
                    <td className="p-2.5 font-mono">
                      {v.secret ? (
                        <div className="flex items-center gap-2">
                          <span>{isRevealed ? v.variableValue || "(secret)" : "••••••••••••"}</span>
                          <button
                            type="button"
                            onClick={() => handleToggleReveal(v.id)}
                            className="text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
                          >
                            {isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      ) : (
                        <span>{v.variableValue || <span className="italic text-[rgb(var(--muted-foreground))]">empty</span>}</span>
                      )}
                    </td>
                    <td className="p-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleSecret(v)}
                        className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded border border-[rgb(var(--border))] hover:bg-[rgb(var(--muted))]"
                        title={v.secret ? "Click to make plain text" : "Click to mark as secret"}
                      >
                        {v.secret ? (
                          <>
                            <Lock className="h-3 w-3 text-amber-500" />
                            <span>Secret</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="h-3 w-3 text-emerald-500" />
                            <span>Plain</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-2.5 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteVariable(v.id)}
                        className="h-7 w-7 p-0 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--danger))]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add new variable inline form */}
      <form onSubmit={handleAddVariable} className="flex items-center gap-2 pt-1">
        <Input
          placeholder="New Key (e.g., API_KEY)"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          className="h-8 text-xs font-mono flex-1"
        />
        <Input
          placeholder="Value"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          className="h-8 text-xs font-mono flex-1"
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setIsSecret(!isSecret)}
          className={`h-8 gap-1 text-xs px-2.5 ${isSecret ? "border-amber-500 text-amber-500" : ""}`}
        >
          {isSecret ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
          {isSecret ? "Secret" : "Plain"}
        </Button>
        <Button type="submit" size="sm" disabled={createVar.isPending} className="h-8 gap-1 text-xs">
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </form>
    </div>
  );
}
