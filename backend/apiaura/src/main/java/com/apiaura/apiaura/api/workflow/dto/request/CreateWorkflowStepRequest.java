package com.apiaura.apiaura.api.workflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateWorkflowStepRequest(

        @NotNull
        UUID requestId,

        @NotBlank
        @Size(max = 150)
        String name,

        @NotNull
        Integer sortOrder,

        Boolean enabled,

        Boolean continueOnFailure,

        @Size(max = 500)
        String extractPath,

        @Size(max = 150)
        String extractVariable
) {
}
