package com.apiaura.apiaura.api.environment.dto.response;

import com.apiaura.apiaura.api.environment.entity.Environment;
import com.apiaura.apiaura.environment.enums.EnvironmentStatus;

import java.time.Instant;
import java.util.UUID;

public record EnvironmentResponse(

        UUID id,
        UUID workspaceId,
        String name,
        String slug,
        String description,
        EnvironmentStatus status,
        boolean active,
        UUID createdBy,
        Instant createdAt,
        Instant updatedAt
) {

    public static EnvironmentResponse from(Environment environment) {
        return new EnvironmentResponse(
                environment.getId(),
                environment.getWorkspace().getId(),
                environment.getName(),
                environment.getSlug(),
                environment.getDescription(),
                environment.getStatus(),
                environment.isActive(),
                environment.getCreatedBy().getId(),
                environment.getCreatedAt(),
                environment.getUpdatedAt()
        );
    }
}
