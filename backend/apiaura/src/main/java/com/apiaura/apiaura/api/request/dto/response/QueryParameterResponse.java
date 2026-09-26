package com.apiaura.apiaura.api.request.dto.response;

import com.apiaura.apiaura.api.request.entity.QueryParameter;

import java.util.UUID;

public record QueryParameterResponse(
        UUID id,
        UUID requestId,
        String paramKey,
        String paramValue,
        boolean enabled,
        Integer sortOrder
) {

    public static QueryParameterResponse from(QueryParameter parameter) {
        return new QueryParameterResponse(
                parameter.getId(),
                parameter.getRequest().getId(),
                parameter.getParamKey(),
                parameter.getParamValue(),
                parameter.isEnabled(),
                parameter.getSortOrder()
        );
    }
}
