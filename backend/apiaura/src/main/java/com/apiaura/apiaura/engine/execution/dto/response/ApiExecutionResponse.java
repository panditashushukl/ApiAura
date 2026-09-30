package com.apiaura.apiaura.engine.execution.dto.response;

import com.apiaura.apiaura.engine.execution.entity.RequestExecution;
import com.apiaura.apiaura.foundation.common.enums.ExecutionStatus;

import java.time.Instant;
import java.util.UUID;

public record ApiExecutionResponse(

        UUID id,

        UUID requestId,

        UUID environmentId,

        ExecutionStatus status,

        String method,

        String url,

        String requestHeaders,

        String requestBody,

        Integer responseStatus,

        String responseHeaders,

        String responseBody,

        Long durationMs,

        Long responseSizeBytes,

        String errorMessage,

        Instant createdAt

) {

    public static ApiExecutionResponse from(RequestExecution execution) {

        return new ApiExecutionResponse(
                execution.getId(),
                execution.getRequest().getId(),
                execution.getEnvironment() != null
                        ? execution.getEnvironment().getId()
                        : null,
                execution.getStatus(),
                execution.getMethod(),
                execution.getResolvedUrl(),
                execution.getRequestHeaders(),
                execution.getRequestBody(),
                execution.getResponseStatus(),
                execution.getResponseHeaders(),
                execution.getResponseBody(),
                execution.getDurationMs(),
                execution.getResponseSizeBytes(),
                execution.getErrorMessage(),
                execution.getCreatedAt()
        );
    }
}
