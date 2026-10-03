package com.apiaura.apiaura.api.collection.dto.response;

import com.apiaura.apiaura.api.collection.entity.Collection;

import java.time.Instant;
import java.util.UUID;

public record CollectionResponse(

        UUID id,
        UUID workspaceId,
        String name,
        String description,
        String preRequestScript,
        String postRequestScript,
        String documentation,
        UUID createdBy,
        Instant createdAt,
        Instant updatedAt
) {

    public static CollectionResponse from(Collection collection) {
        return new CollectionResponse(
                collection.getId(),
                collection.getWorkspace().getId(),
                collection.getName(),
                collection.getDescription(),
                collection.getPreRequestScript(),
                collection.getPostRequestScript(),
                collection.getDocumentation(),
                collection.getCreatedBy().getId(),
                collection.getCreatedAt(),
                collection.getUpdatedAt()
        );
    }
}
