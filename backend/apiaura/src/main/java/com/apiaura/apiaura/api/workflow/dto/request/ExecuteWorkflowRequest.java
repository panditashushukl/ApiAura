package com.apiaura.apiaura.api.workflow.dto.request;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record ExecuteWorkflowRequest(

        @NotNull
        UUID environmentId
) {
}
