package com.apiaura.apiaura.engine.ai.service;

import com.apiaura.apiaura.engine.ai.dto.response.AiActionResponse;
import com.apiaura.apiaura.engine.ai.entity.AiAction;
import com.apiaura.apiaura.engine.ai.entity.AiChatSession;
import com.apiaura.apiaura.ai.enums.AiActionRisk;
import com.apiaura.apiaura.ai.enums.AiActionStatus;
import com.apiaura.apiaura.engine.ai.repository.AiActionRepository;
import com.apiaura.apiaura.engine.ai.repository.AiChatSessionRepository;
import com.apiaura.apiaura.engine.ai.tool.AiTool;
import com.apiaura.apiaura.engine.ai.tool.AiToolContext;
import com.apiaura.apiaura.engine.ai.tool.AiToolResult;
import com.apiaura.apiaura.foundation.common.exception.ForbiddenException;
import com.apiaura.apiaura.foundation.common.exception.ResourceNotFoundException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class AiActionServiceImpl
        implements AiActionService {

    private final AiActionRepository actionRepository;

    private final AiChatSessionRepository sessionRepository;

    private final AiPermissionService permissionService;

    private final ObjectMapper objectMapper;

    public AiActionServiceImpl(
            AiActionRepository actionRepository,
            AiChatSessionRepository sessionRepository,
            AiPermissionService permissionService,
            ObjectMapper objectMapper
    ) {
        this.actionRepository =
                actionRepository;

        this.sessionRepository =
                sessionRepository;

        this.permissionService =
                permissionService;

        this.objectMapper =
                objectMapper;
    }

    @Override
    public AiAction createPendingAction(
            AiToolContext context,
            AiTool tool,
            String toolName,
            String inputJson,
            AiActionRisk risk
    ) {

        AiChatSession session =
                getAuthorizedSession(
                        context.sessionId(),
                        context.userId(),
                        context.workspaceId()
                );

        AiAction action =
                new AiAction();

        action.setSession(session);
        action.setToolName(toolName);
        action.setRisk(risk);
        action.setStatus(
                AiActionStatus.PENDING
        );
        action.setInputJson(
                inputJson
        );
        action.setConfirmationRequired(
                true
        );
        action.setConfirmed(
                false
        );

        return actionRepository.save(
                action
        );
    }

    @Override
    public String execute(
            AiToolContext context,
            AiTool tool,
            String inputJson,
            AiActionRisk risk
    ) {

        if (!permissionService.canExecute(
                context,
                tool.getName()
        )) {

            throw new ForbiddenException(
                    "You do not have permission to execute this AI action."
            );
        }

        AiChatSession session =
                getAuthorizedSession(
                        context.sessionId(),
                        context.userId(),
                        context.workspaceId()
                );

        AiAction action =
                new AiAction();

        action.setSession(session);
        action.setToolName(
                tool.getName()
        );
        action.setRisk(risk);
        action.setStatus(
                AiActionStatus.RUNNING
        );
        action.setInputJson(
                inputJson
        );
        action.setConfirmationRequired(
                false
        );
        action.setConfirmed(
                true
        );

        action =
                actionRepository.save(
                        action
                );

        try {

            Map<String, Object> input =
                    objectMapper.readValue(
                            inputJson,
                            new TypeReference<>() {
                            }
                    );

            AiToolResult result =
                    tool.execute(
                            context,
                            input
                    );

            if (!result.success()) {

                action.setStatus(
                        AiActionStatus.FAILED
                );

                action.setErrorMessage(
                        result.error()
                );

                actionRepository.save(
                        action
                );

                return "AI action failed: "
                        + result.error();
            }

            action.setStatus(
                    AiActionStatus.SUCCESS
            );

            action.setOutputJson(
                    objectMapper.writeValueAsString(
                            result.data()
                    )
            );

            actionRepository.save(
                    action
            );

            return objectMapper.writeValueAsString(
                    result.data()
            );

        } catch (Exception exception) {

            action.setStatus(
                    AiActionStatus.FAILED
            );

            action.setErrorMessage(
                    exception.getMessage()
            );

            actionRepository.save(
                    action
            );

            throw new RuntimeException(
                    "AI action execution failed",
                    exception
            );
        }
    }

    @Override
    public AiActionResponse confirm(
            UUID actionId
    ) {

        AiAction action =
                actionRepository.findById(
                        actionId
                ).orElseThrow(
                        () -> new ResourceNotFoundException(
                                "AI action not found: "
                                        + actionId
                        )
                );

        if (action.getStatus()
                != AiActionStatus.PENDING) {

            throw new IllegalStateException(
                    "Only pending actions can be confirmed."
            );
        }

        /*
         * Tool lookup is required.
         */
        // inject AiToolRegistry into this service
        // and resolve action.getToolName().

        action.setConfirmed(
                true
        );

        action.setStatus(
                AiActionStatus.CONFIRMED
        );

        actionRepository.save(
                action
        );

        return AiActionResponse.from(
                action
        );
    }

    @Override
    public AiActionResponse reject(
            UUID actionId
    ) {

        AiAction action =
                actionRepository.findById(
                        actionId
                ).orElseThrow(
                        () -> new ResourceNotFoundException(
                                "AI action not found: "
                                        + actionId
                        )
                );

        if (action.getStatus()
                != AiActionStatus.PENDING) {

            throw new IllegalStateException(
                    "Only pending actions can be rejected."
            );
        }

        action.setConfirmed(
                false
        );

        action.setStatus(
                AiActionStatus.REJECTED
        );

        actionRepository.save(
                action
        );

        return AiActionResponse.from(
                action
        );
    }

    @Override
    public List<AiActionResponse> getSessionActions(
            UUID sessionId
    ) {

        return actionRepository
                .findBySessionIdOrderByCreatedAtAsc(
                        sessionId
                )
                .stream()
                .map(AiActionResponse::from)
                .toList();
    }

    private AiChatSession getAuthorizedSession(
            UUID sessionId,
            UUID userId,
            UUID workspaceId
    ) {

        AiChatSession session =
                sessionRepository.findById(
                        sessionId
                ).orElseThrow(
                        () -> new ResourceNotFoundException(
                                "AI session not found: "
                                        + sessionId
                        )
                );

        if (!session.getUser()
                .getId()
                .equals(userId)) {

            throw new ForbiddenException(
                    "You do not have access to this AI session."
            );
        }

        if (!session.getWorkspace()
                .getId()
                .equals(workspaceId)) {

            throw new ForbiddenException(
                    "AI session does not belong to this workspace."
            );
        }

        return session;
    }
}
