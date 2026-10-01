"use client";

import { useEnvironments, useActivateEnvironment } from "../hooks/use-environments";
import { useToast } from "@/components/feedback/toast-system";
import { Globe } from "lucide-react";
import type { Environment } from "../types/environment.types";

interface EnvironmentSelectorProps {
  workspaceId: string;
  selectedEnvironmentId?: string | null;
  onSelectEnvironment?: (env: Environment | null) => void;
}

export function EnvironmentSelector({
  workspaceId,
  selectedEnvironmentId,
  onSelectEnvironment,
}: EnvironmentSelectorProps) {
  const { data: environments = [] } = useEnvironments(workspaceId);
  const activateEnv = useActivateEnvironment(workspaceId);
  const toast = useToast();

  const activeEnv = environments.find((e) => e.active) || environments.find((e) => e.id === selectedEnvironmentId);

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const envId = e.target.value;
    if (!envId) {
      onSelectEnvironment?.(null);
      return;
    }
    const env = environments.find((item) => item.id === envId) || null;
    onSelectEnvironment?.(env);

    // Optionally call activate endpoint on backend
    activateEnv.mutate(envId, {
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Failed to activate environment");
      },
    });
  };

  return (
    <div className="flex items-center gap-1.5 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-md px-2.5 py-1 text-xs">
      <Globe className="h-3.5 w-3.5 text-[rgb(var(--primary))]" />
      <select
        value={activeEnv?.id || ""}
        onChange={handleSelect}
        className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer pr-1 text-[rgb(var(--foreground))]"
      >
        <option value="" className="bg-[rgb(var(--card))] text-[rgb(var(--muted-foreground))]">
          No Environment
        </option>
        {environments.map((env) => (
          <option key={env.id} value={env.id} className="bg-[rgb(var(--card))] text-[rgb(var(--foreground))]">
            {env.name} {env.active ? "(Active)" : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
