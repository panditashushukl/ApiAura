package com.apiaura.apiaura.engine.ai.dto.response;

import com.apiaura.apiaura.engine.ai.entity.AiAction;
import com.apiaura.apiaura.ai.enums.AiActionRisk;
import com.apiaura.apiaura.ai.enums.AiActionStatus;

import java.time.Instant;
import java.util.UUID;

public record AiActionResponse(
        UUID id,
        UUID sessionId,
        String toolName,
        AiActionRisk risk,
        AiActionStatus status,
        String inputJson,
        String outputJson,
        String errorMessage,
        boolean confirmationRequired,
        boolean confirmed,
        Instant createdAt,
        Instant updatedAt
) {

    public static AiActionResponse from(
            AiAction action
    ) {

        return new AiActionResponse(
                action.getId(),
                action.getSession().getId(),
                action.getToolName(),
                action.getRisk(),
                action.getStatus(),
                action.getInputJson(),
                action.getOutputJson(),
                action.getErrorMessage(),
                action.isConfirmationRequired(),
                action.isConfirmed(),
                action.getCreatedAt(),
                action.getUpdatedAt()
        );
    }
}
