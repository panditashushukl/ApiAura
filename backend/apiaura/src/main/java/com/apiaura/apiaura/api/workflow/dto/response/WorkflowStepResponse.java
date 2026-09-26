package com.apiaura.apiaura.api.workflow.dto.response;

import com.apiaura.apiaura.api.workflow.entity.WorkflowStep;

import java.util.UUID;

public record WorkflowStepResponse(

        UUID id,
        UUID workflowId,
        UUID requestId,
        String name,
        int sortOrder,
        boolean enabled,
        boolean continueOnFailure,
        String extractPath,
        String extractVariable

) {

    public static WorkflowStepResponse from(
            WorkflowStep step
    ) {

        return new WorkflowStepResponse(
                step.getId(),
                step.getWorkflow().getId(),
                step.getRequest().getId(),
                step.getName(),
                step.getSortOrder(),
                step.isEnabled(),
                step.isContinueOnFailure(),
                step.getExtractPath(),
                step.getExtractVariable()
        );
    }
}
