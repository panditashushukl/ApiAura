package com.apiaura.apiaura.engine.execution.dto.request;

import jakarta.validation.constraints.NotNull;

import java.util.Map;
import java.util.UUID;

public record ExecuteApiRequest(

        @NotNull(message = "Environment ID is required")
        UUID environmentId,

        Map<String, String> variables

) {
        // Canonical constructor ensuring variables is never null
        public ExecuteApiRequest {
                variables = variables != null ? variables : Map.of();
        }

        // Convenience constructor for standalone requests without dynamic variables
        public ExecuteApiRequest(UUID environmentId) {
                this(environmentId, Map.of());
        }
}
