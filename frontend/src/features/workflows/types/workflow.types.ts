export type WorkflowStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

export type WorkflowExecutionStatus =
  | "PENDING"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export interface WorkflowStep {
  id: string;
  workflowId: string;
  requestId?: string;
  stepOrder: number;
  name: string;
  targetJsonPath?: string;
  targetVariableKey?: string;
}

export interface Workflow {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  status: WorkflowStatus;
  steps?: WorkflowStep[];
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowExecutionResponse {
  id: string;
  workflowId: string;
  environmentId?: string | null;
  status: WorkflowExecutionStatus;
  totalSteps: number;
  completedSteps: number;
  failedSteps: number;
  durationMs: number;
  errorMessage?: string | null;
  createdAt: string;
}

export interface CreateWorkflowRequest {
  name: string;
  description?: string;
}
