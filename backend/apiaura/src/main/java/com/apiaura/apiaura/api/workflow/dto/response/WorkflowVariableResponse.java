package com.apiaura.apiaura.api.workflow.dto.response;

import com.apiaura.apiaura.api.workflow.entity.WorkflowVariable;

import java.util.UUID;

public record WorkflowVariableResponse(

        UUID id,
        UUID workflowId,
        String variableKey,
        String variableValue,
        boolean secret,
        boolean enabled

) {

    public static WorkflowVariableResponse from(
            WorkflowVariable variable
    ) {

        return new WorkflowVariableResponse(
                variable.getId(),
                variable.getWorkflow().getId(),
                variable.getVariableKey(),
                variable.isSecret()
                        ? null
                        : variable.getVariableValue(),
                variable.isSecret(),
                variable.isEnabled()
        );
    }
}
