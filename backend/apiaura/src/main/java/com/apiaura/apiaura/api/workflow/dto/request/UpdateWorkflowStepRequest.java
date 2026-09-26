package com.apiaura.apiaura.api.workflow.dto.request;

import jakarta.validation.constraints.Size;

public record UpdateWorkflowStepRequest(

        @Size(max = 150)
        String name,

        Integer sortOrder,

        Boolean enabled,

        Boolean continueOnFailure,

        @Size(max = 500)
        String extractPath,

        @Size(max = 150)
        String extractVariable
) {
}
