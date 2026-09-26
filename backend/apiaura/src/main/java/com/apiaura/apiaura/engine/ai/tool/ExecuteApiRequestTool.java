package com.apiaura.apiaura.engine.ai.tool;

import com.apiaura.apiaura.ai.enums.AiActionRisk;
import com.apiaura.apiaura.engine.execution.dto.request.ExecuteApiRequest;
import com.apiaura.apiaura.engine.execution.dto.response.ApiExecutionResponse;
import com.apiaura.apiaura.engine.execution.service.ApiExecutionService;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;

@Component
public class ExecuteApiRequestTool
        implements AiTool {

    private final ApiExecutionService executionService;

    public ExecuteApiRequestTool(
            ApiExecutionService executionService
    ) {
        this.executionService =
                executionService;
    }

    @Override
    public String getName() {
        return "execute_api_request";
    }

    @Override
    public String getDescription() {

        return """
                Execute an existing API request against
                a selected environment.

                This action performs a real HTTP request and
                therefore requires explicit confirmation.
                """;
    }

    @Override
    public AiActionRisk getRisk() {
        return AiActionRisk.HIGH;
    }

    @Override
    public Map<String, Object> getInputSchema() {

        return Map.of(
                "requestId",
                "UUID - required",

                "environmentId",
                "UUID - required"
        );
    }

    @Override
    public AiToolResult execute(
            AiToolContext context,
            Map<String, Object> input
    ) {

        try {

            UUID requestId =
                    UUID.fromString(
                            required(
                                    input,
                                    "requestId"
                            )
                    );

            UUID environmentId =
                    UUID.fromString(
                            required(
                                    input,
                                    "environmentId"
                            )
                    );

            ExecuteApiRequest request =
                    new ExecuteApiRequest(
                            environmentId
                    );

            /*
             * Existing execution service handles:
             *
             * - request loading
             * - workspace authorization
             * - environment validation
             * - variable resolution
             * - authentication
             * - SSRF validation
             * - HTTP execution
             * - RequestExecution persistence
             */
            ApiExecutionResponse response =
                    executionService.execute(
                            requestId,
                            request
                    );

            return AiToolResult.success(
                    response
            );

        } catch (Exception exception) {

            return AiToolResult.failure(
                    exception.getMessage()
            );
        }
    }

    private String required(
            Map<String, Object> input,
            String key
    ) {

        Object value =
                input.get(key);

        if (value == null) {
            throw new IllegalArgumentException(
                    key + " is required"
            );
        }

        String result =
                value.toString().trim();

        if (result.isBlank()) {
            throw new IllegalArgumentException(
                    key + " cannot be blank"
            );
        }

        return result;
    }
}