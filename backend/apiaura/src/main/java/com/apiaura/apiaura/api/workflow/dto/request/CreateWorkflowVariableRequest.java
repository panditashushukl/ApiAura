package com.apiaura.apiaura.api.workflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateWorkflowVariableRequest(

        @NotBlank
        @Size(max = 150)
        String variableKey,

        String variableValue,

        Boolean secret,

        Boolean enabled
) {
}
