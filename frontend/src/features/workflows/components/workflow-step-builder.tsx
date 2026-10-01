"use client";

import { useState } from "react";
import { Plus, Trash2, ArrowDown, ArrowUp, ArrowRight, CornerDownRight, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/feedback/toast-system";
import type { WorkflowStep } from "../types/workflow.types";

interface WorkflowStepBuilderProps {
  steps: WorkflowStep[];
  onChangeSteps: (steps: WorkflowStep[]) => void;
}

export function WorkflowStepBuilder({ steps, onChangeSteps }: WorkflowStepBuilderProps) {
  const toast = useToast();

  const [stepName, setStepName] = useState("");
  const [jsonPath, setJsonPath] = useState("");
  const [varKey, setVarKey] = useState("");

  const handleAddStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stepName.trim()) {
      toast.error("Step name is required");
      return;
    }

    const newStep: WorkflowStep = {
      id: "step_" + Date.now(),
      workflowId: "",
      stepOrder: steps.length + 1,
      name: stepName.trim(),
      targetJsonPath: jsonPath.trim() || undefined,
      targetVariableKey: varKey.trim() || undefined,
    };

    onChangeSteps([...steps, newStep]);
    setStepName("");
    setJsonPath("");
    setVarKey("");
    toast.success("Workflow step added");
  };

  const handleRemoveStep = (id: string) => {
    const updated = steps
      .filter((s) => s.id !== id)
      .map((s, idx) => ({ ...s, stepOrder: idx + 1 }));
    onChangeSteps(updated);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= steps.length) return;

    const list = [...steps];
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    const reordered = list.map((s, idx) => ({ ...s, stepOrder: idx + 1 }));
    onChangeSteps(reordered);
  };

  return (
    <div className="space-y-4">
      {/* Steps Sequence Flow */}
      <div className="space-y-3">
        {steps.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-[rgb(var(--border))] rounded-md text-xs text-[rgb(var(--muted-foreground))]">
            No execution steps in this workflow sequence yet. Add your first step below.
          </div>
        ) : (
          steps.map((step, idx) => (
            <div key={step.id} className="relative">
              {/* Connector line between steps */}
              {idx > 0 && (
                <div className="flex items-center justify-center my-1 text-[rgb(var(--muted-foreground))]">
                  <ArrowDown className="h-4 w-4" />
                </div>
              )}

              <div className="p-3.5 border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--card))] flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="h-6 w-6 rounded-full bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))] font-bold flex items-center justify-center text-[11px]">
                    {step.stepOrder}
                  </span>

                  <div>
                    <h4 className="font-semibold text-[rgb(var(--foreground))]">{step.name}</h4>
                    {step.targetJsonPath && step.targetVariableKey && (
                      <div className="flex items-center gap-1.5 text-[11px] text-[rgb(var(--muted-foreground))] mt-0.5 font-mono">
                        <CornerDownRight className="h-3 w-3 text-[rgb(var(--primary))]" />
                        <span>Extract JSON Path</span>
                        <Badge variant="default" className="text-[10px] py-0 font-mono">
                          {step.targetJsonPath}
                        </Badge>
                        <ArrowRight className="h-3 w-3" />
                        <span>Save to variable</span>
                        <Badge variant="success" className="text-[10px] py-0 font-mono">
                          {`{{${step.targetVariableKey}}}`}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, "up")}
                    className="h-7 w-7 p-0"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={idx === steps.length - 1}
                    onClick={() => handleMove(idx, "down")}
                    className="h-7 w-7 p-0"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveStep(step.id)}
                    className="h-7 w-7 p-0 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--danger))]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Step Inline Form */}
      <form onSubmit={handleAddStep} className="p-3 border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--card))] space-y-3">
        <h4 className="text-xs font-semibold flex items-center gap-1.5">
          <Settings2 className="h-3.5 w-3.5 text-[rgb(var(--primary))]" /> Add Sequential Step & Variable Extraction
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <label className="text-[10px] text-[rgb(var(--muted-foreground))] block mb-1">Step Label</label>
            <Input
              value={stepName}
              onChange={(e) => setStepName(e.target.value)}
              placeholder="Step 1: Obtain Auth Token"
              className="h-8 text-xs"
            />
          </div>

          <div>
            <label className="text-[10px] text-[rgb(var(--muted-foreground))] block mb-1">Extract JSON Path (Optional)</label>
            <Input
              value={jsonPath}
              onChange={(e) => setJsonPath(e.target.value)}
              placeholder="e.g. $.token or data.accessToken"
              className="h-8 text-xs font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] text-[rgb(var(--muted-foreground))] block mb-1">Save Variable Name (Optional)</label>
            <Input
              value={varKey}
              onChange={(e) => setVarKey(e.target.value)}
              placeholder="e.g. authToken"
              className="h-8 text-xs font-mono"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <Button type="submit" size="sm" className="h-8 text-xs gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Append Step
          </Button>
        </div>
      </form>
    </div>
  );
}
