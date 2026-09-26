package com.apiaura.apiaura.api.request.dto.response;

import com.apiaura.apiaura.foundation.common.enums.BodyType;
import com.apiaura.apiaura.foundation.common.enums.HttpMethod;
import com.apiaura.apiaura.api.request.entity.ApiRequest;

import java.time.Instant;
import java.util.UUID;

public record ApiRequestResponse(

        UUID id,
        UUID collectionId,
        UUID folderId,
        UUID parentRequestId,
        String name,
        HttpMethod method,
        String url,
        String description,
        String documentation,
        BodyType bodyType,
        String body,
        boolean enabled,
        UUID createdBy,
        Instant createdAt,
        Instant updatedAt
) {

    public static ApiRequestResponse from(ApiRequest request) {
        return new ApiRequestResponse(
                request.getId(),
                request.getCollection().getId(),
                request.getFolder() != null
                        ? request.getFolder().getId()
                        : null,
                request.getParentRequest() != null
                        ? request.getParentRequest().getId()
                        : null,
                request.getName(),
                request.getMethod(),
                request.getUrl(),
                request.getDescription(),
                request.getDocumentation(),
                request.getBodyType(),
                request.getBody(),
                request.isEnabled(),
                request.getCreatedBy().getId(),
                request.getCreatedAt(),
                request.getUpdatedAt()
        );
    }
}
