package com.apiaura.apiaura.engine.ai.dto.response;

import com.apiaura.apiaura.engine.ai.entity.AiChatSession;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ChatSessionResponse(
        UUID id,
        UUID workspaceId,
        UUID userId,
        String title,
        Instant createdAt,
        Instant updatedAt,
        List<ChatMessageResponse> messages,
        List<AiActionResponse> actions
) {

    public static ChatSessionResponse from(
            AiChatSession session
    ) {

        return new ChatSessionResponse(
                session.getId(),
                session.getWorkspace().getId(),
                session.getUser().getId(),
                session.getTitle(),
                session.getCreatedAt(),
                session.getUpdatedAt(),
                session.getMessages()
                        .stream()
                        .map(ChatMessageResponse::from)
                        .toList(),
                session.getActions()
                        .stream()
                        .map(AiActionResponse::from)
                        .toList()
        );
    }
}
