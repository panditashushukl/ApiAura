package com.apiaura.apiaura.api.workflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateWorkflowRequest(

        @NotBlank
        @Size(max = 150)
        String name,

        @Size(max = 2000)
        String description
) {
}
