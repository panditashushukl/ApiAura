package com.apiaura.apiaura.engine.execution.dto.request;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record ExecuteApiRequest(

        @NotNull(message = "Environment ID is required")
        UUID environmentId

) {
}
