package com.apiaura.apiaura.engine.ai.service;

import com.apiaura.apiaura.ai.enums.AiActionRisk;
import com.apiaura.apiaura.engine.ai.provider.AiProvider;
import com.apiaura.apiaura.engine.ai.provider.AiProviderMessage;
import com.apiaura.apiaura.engine.ai.provider.AiProviderResponse;
import com.apiaura.apiaura.engine.ai.provider.AiProviderTool;
import com.apiaura.apiaura.engine.ai.security.AiRiskClassifier;
import com.apiaura.apiaura.engine.ai.tool.AiTool;
import com.apiaura.apiaura.engine.ai.tool.AiToolContext;
import com.apiaura.apiaura.engine.ai.tool.AiToolRegistry;
import com.apiaura.apiaura.foundation.common.exception.ForbiddenException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AiAgentServiceImpl
        implements AiAgentService {

    private final AiProvider aiProvider;

    private final AiToolRegistry toolRegistry;

    private final AiPermissionService permissionService;

    private final AiRiskClassifier riskClassifier;

    private final AiActionService actionService;

    public AiAgentServiceImpl(
            AiProvider aiProvider,
            AiToolRegistry toolRegistry,
            AiPermissionService permissionService,
            AiRiskClassifier riskClassifier,
            AiActionService actionService
    ) {
        this.aiProvider =
                aiProvider;

        this.toolRegistry =
                toolRegistry;

        this.permissionService =
                permissionService;

        this.riskClassifier =
                riskClassifier;

        this.actionService =
                actionService;
    }

    @Override
    public String process(
            AiToolContext context,
            List<AiProviderMessage> messages
    ) {

        List<AiProviderTool> tools =
                toolRegistry.getAll()
                        .stream()
                        .map(
                                tool ->
                                        new AiProviderTool(
                                                tool.getName(),
                                                tool.getDescription(),
                                                tool.getInputSchema()
                                        )
                        )
                        .toList();

        String systemPrompt =
                """
                You are Apiaura AI.

                Apiaura is an API development,
                testing and automation platform.

                You help users:

                - create API requests
                - configure requests
                - execute requests
                - generate API tests
                - create workflows
                - debug API failures

                Rules:

                1. Never directly access a database.
                2. Never invent tool execution results.
                3. Never claim an action succeeded unless
                   the corresponding tool actually succeeded.
                4. Use tools when an actual application
                   operation is requested.
                5. Never expose secrets, API keys,
                   passwords or tokens.
                6. For destructive or externally executing
                   actions, respect the confirmation system.
                """;

        AiProviderResponse response =
                aiProvider.generate(
                        systemPrompt,
                        messages,
                        tools
                );

        if (!response.toolCall()) {

            return response.content();
        }

        AiTool tool =
                toolRegistry.get(
                        response.toolName()
                );

        if (!permissionService.canExecute(
                context,
                tool.getName()
        )) {

            throw new ForbiddenException(
                    "You do not have permission to execute "
                            + tool.getName()
            );
        }

        AiActionRisk risk =
                riskClassifier.classify(
                        tool.getName()
                );

        if (riskClassifier.requiresConfirmation(
                risk
        )) {

            actionService.createPendingAction(
                    context,
                    tool,
                    response.toolName(),
                    response.toolArguments(),
                    risk
            );

            return """
                    This action requires confirmation
                    before execution.
                    """;
        }

        return actionService.execute(
                context,
                tool,
                response.toolArguments(),
                risk
        );
    }
}
