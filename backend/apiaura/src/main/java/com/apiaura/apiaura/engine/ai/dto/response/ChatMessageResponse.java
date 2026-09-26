package com.apiaura.apiaura.engine.ai.dto.response;

import com.apiaura.apiaura.engine.ai.entity.AiMessage;
import com.apiaura.apiaura.ai.enums.AiMessageRole;

import java.time.Instant;
import java.util.UUID;

public record ChatMessageResponse(
        UUID id,
        UUID sessionId,
        AiMessageRole role,
        String content,
        Instant createdAt
) {

    public static ChatMessageResponse from(
            AiMessage message
    ) {

        return new ChatMessageResponse(
                message.getId(),
                message.getSession().getId(),
                message.getRole(),
                message.getContent(),
                message.getCreatedAt()
        );
    }
}
