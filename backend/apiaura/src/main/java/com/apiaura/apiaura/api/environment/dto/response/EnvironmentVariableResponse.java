package com.apiaura.apiaura.api.environment.dto.response;

import com.apiaura.apiaura.api.environment.entity.EnvironmentVariable;

import java.time.Instant;
import java.util.UUID;

public record EnvironmentVariableResponse(

        UUID id,
        UUID environmentId,
        String variableKey,
        String variableValue,
        boolean secret,
        boolean enabled,
        Instant createdAt,
        Instant updatedAt
) {

    public static EnvironmentVariableResponse from(
            EnvironmentVariable variable
    ) {
        return new EnvironmentVariableResponse(
                variable.getId(),
                variable.getEnvironment().getId(),
                variable.getVariableKey(),
                variable.isSecret()
                        ? null
                        : variable.getVariableValue(),
                variable.isSecret(),
                variable.isEnabled(),
                variable.getCreatedAt(),
                variable.getUpdatedAt()
        );
    }
}
