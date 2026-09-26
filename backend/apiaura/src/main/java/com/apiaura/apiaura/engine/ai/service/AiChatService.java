package com.apiaura.apiaura.engine.ai.service;

import com.apiaura.apiaura.ai.dto.request.CreateChatSessionRequest;
import com.apiaura.apiaura.engine.ai.dto.request.SendMessageRequest;
import com.apiaura.apiaura.engine.ai.dto.response.ChatMessageResponse;
import com.apiaura.apiaura.engine.ai.dto.response.ChatSessionResponse;

import java.util.UUID;

public interface AiChatService {

    ChatSessionResponse createSession(
            UUID workspaceId,
            CreateChatSessionRequest request
    );

    ChatSessionResponse getSession(
            UUID sessionId
    );

    ChatMessageResponse sendMessage(
            UUID sessionId,
            SendMessageRequest request
    );
}
