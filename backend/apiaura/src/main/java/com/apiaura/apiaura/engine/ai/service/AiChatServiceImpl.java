package com.apiaura.apiaura.engine.ai.service;

import com.apiaura.apiaura.ai.dto.request.CreateChatSessionRequest;
import com.apiaura.apiaura.engine.ai.dto.request.SendMessageRequest;
import com.apiaura.apiaura.engine.ai.dto.response.ChatMessageResponse;
import com.apiaura.apiaura.engine.ai.dto.response.ChatSessionResponse;
import com.apiaura.apiaura.engine.ai.entity.AiChatSession;
import com.apiaura.apiaura.engine.ai.entity.AiMessage;
import com.apiaura.apiaura.ai.enums.AiMessageRole;
import com.apiaura.apiaura.engine.ai.provider.AiProviderMessage;
import com.apiaura.apiaura.engine.ai.repository.AiChatSessionRepository;
import com.apiaura.apiaura.engine.ai.repository.AiMessageRepository;
import com.apiaura.apiaura.engine.ai.tool.AiToolContext;
import com.apiaura.apiaura.foundation.common.exception.ForbiddenException;
import com.apiaura.apiaura.foundation.common.exception.ResourceNotFoundException;
import com.apiaura.apiaura.identity.user.entity.User;
import com.apiaura.apiaura.identity.user.repository.UserRepository;
import com.apiaura.apiaura.org.workspace.entity.Workspace;
import com.apiaura.apiaura.org.workspace.repository.WorkspaceRepository;
import com.apiaura.apiaura.foundation.common.security.SecurityUtils;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class AiChatServiceImpl
        implements AiChatService {

    private final AiChatSessionRepository sessionRepository;

    private final AiMessageRepository messageRepository;

    private final WorkspaceRepository workspaceRepository;

    private final UserRepository userRepository;

    private final AiAgentService aiAgentService;

    public AiChatServiceImpl(
            AiChatSessionRepository sessionRepository,
            AiMessageRepository messageRepository,
            WorkspaceRepository workspaceRepository,
            UserRepository userRepository,
            AiAgentService aiAgentService
    ) {
        this.sessionRepository =
                sessionRepository;

        this.messageRepository =
                messageRepository;

        this.workspaceRepository =
                workspaceRepository;

        this.userRepository =
                userRepository;

        this.aiAgentService =
                aiAgentService;
    }

    @Override
    public ChatSessionResponse createSession(
            UUID workspaceId,
            CreateChatSessionRequest request
    ) {

        UUID userId =
                SecurityUtils.getCurrentUserId();

        User user =
                userRepository.findById(
                        userId
                ).orElseThrow(
                        () -> new ResourceNotFoundException(
                                "User not found."
                        )
                );

        Workspace workspace =
                workspaceRepository.findById(
                        workspaceId
                ).orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Workspace not found."
                        )
                );

        AiChatSession session =
                new AiChatSession();

        session.setWorkspace(
                workspace
        );

        session.setUser(
                user
        );

        session.setTitle(
                request.title()
        );

        session =
                sessionRepository.save(
                        session
                );

        return ChatSessionResponse.from(
                session
        );
    }

    @Override
    public ChatSessionResponse getSession(
            UUID sessionId
    ) {

        UUID userId =
                SecurityUtils.getCurrentUserId();

        AiChatSession session =
                getAuthorizedSession(
                        sessionId,
                        userId
                );

        return ChatSessionResponse.from(
                session
        );
    }

    @Override
    public ChatMessageResponse sendMessage(
            UUID sessionId,
            SendMessageRequest request
    ) {

        UUID userId =
                SecurityUtils.getCurrentUserId();

        AiChatSession session =
                getAuthorizedSession(
                        sessionId,
                        userId
                );

        AiMessage userMessage =
                new AiMessage();

        userMessage.setSession(
                session
        );

        userMessage.setRole(
                AiMessageRole.USER
        );

        userMessage.setContent(
                request.message()
        );

        messageRepository.save(
                userMessage
        );

        List<AiProviderMessage> history =
                messageRepository
                        .findBySessionIdOrderByCreatedAtAsc(
                                sessionId
                        )
                        .stream()
                        .map(
                                message ->
                                        new AiProviderMessage(
                                                message.getRole()
                                                        .name()
                                                        .toLowerCase(),
                                                message.getContent()
                                        )
                        )
                        .toList();

        AiToolContext context =
                new AiToolContext(
                        userId,
                        session.getWorkspace().getId(),
                        sessionId
                );

        String aiResponse =
                aiAgentService.process(
                        context,
                        history
                );

        AiMessage assistantMessage =
                new AiMessage();

        assistantMessage.setSession(
                session
        );

        assistantMessage.setRole(
                AiMessageRole.ASSISTANT
        );

        assistantMessage.setContent(
                aiResponse
        );

        assistantMessage =
                messageRepository.save(
                        assistantMessage
                );

        return ChatMessageResponse.from(
                assistantMessage
        );
    }

    private AiChatSession getAuthorizedSession(
            UUID sessionId,
            UUID userId
    ) {

        AiChatSession session =
                sessionRepository.findById(
                        sessionId
                ).orElseThrow(
                        () -> new ResourceNotFoundException(
                                "AI session not found."
                        )
                );

        if (!session.getUser()
                .getId()
                .equals(userId)) {

            throw new ForbiddenException(
                    "You do not have access to this AI session."
            );
        }

        return session;
    }
}
