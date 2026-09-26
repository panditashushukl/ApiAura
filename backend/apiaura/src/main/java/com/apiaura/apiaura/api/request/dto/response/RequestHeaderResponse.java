package com.apiaura.apiaura.api.request.dto.response;

import com.apiaura.apiaura.api.request.entity.RequestHeader;

import java.util.UUID;

public record RequestHeaderResponse(
        UUID id,
        UUID requestId,
        String headerKey,
        String headerValue,
        boolean enabled,
        boolean secret,
        Integer sortOrder
) {

    public static RequestHeaderResponse from(RequestHeader header) {
        return new RequestHeaderResponse(
                header.getId(),
                header.getRequest().getId(),
                header.getHeaderKey(),
                header.getHeaderValue(),
                header.isEnabled(),
                header.isSecret(),
                header.getSortOrder()
        );
    }
}
