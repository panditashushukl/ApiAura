package com.apiaura.apiaura.api.history.dto.response;

import com.apiaura.apiaura.engine.execution.entity.RequestExecution;
import com.apiaura.apiaura.execution.enums.ExecutionStatus;

import java.time.Instant;
import java.util.UUID;

public record RequestHistoryDetailResponse(

        UUID id,

        UUID requestId,

        UUID collectionId,

        UUID environmentId,

        String method,

        String url,

        String requestHeaders,

        String requestBody,

        ExecutionStatus status,

        Integer responseStatus,

        String responseHeaders,

        String responseBody,

        Long durationMs,

        Long responseSizeBytes,

        String errorMessage,

        Instant createdAt,

        Instant updatedAt

) {

    public static RequestHistoryDetailResponse from(
            RequestExecution execution
    ) {

        return new RequestHistoryDetailResponse(
                execution.getId(),
                execution.getRequest().getId(),
                execution.getRequest()
                        .getCollection()
                        .getId(),
                execution.getEnvironment() != null
                        ? execution.getEnvironment().getId()
                        : null,
                execution.getMethod(),
                execution.getResolvedUrl(),
                maskSensitiveHeaders(
                        execution.getRequestHeaders()
                ),
                execution.getRequestBody(),
                execution.getStatus(),
                execution.getResponseStatus(),
                maskSensitiveHeaders(
                        execution.getResponseHeaders()
                ),
                execution.getResponseBody(),
                execution.getDurationMs(),
                execution.getResponseSizeBytes(),
                execution.getErrorMessage(),
                execution.getCreatedAt(),
                execution.getUpdatedAt()
        );
    }

    private static String maskSensitiveHeaders(
            String headers
    ) {

        if (headers == null ||
                headers.isBlank()) {
            return headers;
        }

        /*
         * RequestExecution currently stores headers as JSON.
         * We deliberately avoid returning sensitive credentials.
         */
        return headers
                .replaceAll(
                        "(?i)(\"Authorization\"\\s*:\\s*\")[^\"]*",
                        "$1***MASKED***"
                )
                .replaceAll(
                        "(?i)(\"[xX]-[aA][pP][iI]-[kK][eE][yY]\"\\s*:\\s*\")[^\"]*",
                        "$1***MASKED***"
                )
                .replaceAll(
                        "(?i)(\"[aA]pi-[kK]ey\"\\s*:\\s*\")[^\"]*",
                        "$1***MASKED***"
                );
    }
}
