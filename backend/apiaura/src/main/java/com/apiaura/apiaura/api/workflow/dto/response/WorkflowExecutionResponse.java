package com.apiaura.apiaura.api.workflow.dto.response;

import com.apiaura.apiaura.api.workflow.entity.WorkflowExecution;
import com.apiaura.apiaura.api.workflow.enums.WorkflowExecutionStatus;

import java.time.Instant;
import java.util.UUID;

public record WorkflowExecutionResponse(

        UUID id,
        UUID workflowId,
        UUID environmentId,
        WorkflowExecutionStatus status,
        int totalSteps,
        int completedSteps,
        int failedSteps,
        long durationMs,
        String errorMessage,
        Instant createdAt

) {

    public static WorkflowExecutionResponse from(
            WorkflowExecution execution
    ) {

        return new WorkflowExecutionResponse(
                execution.getId(),
                execution.getWorkflow().getId(),
                execution.getEnvironment() == null
                        ? null
                        : execution.getEnvironment().getId(),
                execution.getStatus(),
                execution.getTotalSteps(),
                execution.getCompletedSteps(),
                execution.getFailedSteps(),
                execution.getDurationMs(),
                execution.getErrorMessage(),
                execution.getCreatedAt()
        );
    }
}
