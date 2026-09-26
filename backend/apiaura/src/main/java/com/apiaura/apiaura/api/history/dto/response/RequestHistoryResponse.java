package com.apiaura.apiaura.api.history.dto.response;

import com.apiaura.apiaura.engine.execution.entity.RequestExecution;
import com.apiaura.apiaura.foundation.common.enums.ExecutionStatus;

import java.time.Instant;
import java.util.UUID;

public record RequestHistoryResponse(

        UUID id,

        UUID requestId,

        UUID collectionId,

        UUID environmentId,

        String method,

        String url,

        ExecutionStatus status,

        Integer responseStatus,

        Long durationMs,

        Long responseSizeBytes,

        Instant createdAt

) {

    public static RequestHistoryResponse from(
            RequestExecution execution
    ) {

        return new RequestHistoryResponse(
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
                execution.getStatus(),
                execution.getResponseStatus(),
                execution.getDurationMs(),
                execution.getResponseSizeBytes(),
                execution.getCreatedAt()
        );
    }
}
