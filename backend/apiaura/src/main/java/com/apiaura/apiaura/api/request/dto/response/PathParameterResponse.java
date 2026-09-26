package com.apiaura.apiaura.api.request.dto.response;

import com.apiaura.apiaura.api.request.entity.PathParameter;

import java.util.UUID;

public record PathParameterResponse(
        UUID id,
        UUID requestId,
        String paramKey,
        String paramValue,
        boolean enabled,
        Integer sortOrder
) {

    public static PathParameterResponse from(PathParameter parameter) {
        return new PathParameterResponse(
                parameter.getId(),
                parameter.getRequest().getId(),
                parameter.getParamKey(),
                parameter.getParamValue(),
                parameter.isEnabled(),
                parameter.getSortOrder()
        );
    }
}
