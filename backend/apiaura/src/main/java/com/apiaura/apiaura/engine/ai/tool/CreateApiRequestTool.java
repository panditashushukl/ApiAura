package com.apiaura.apiaura.engine.ai.tool;

import com.apiaura.apiaura.ai.enums.AiActionRisk;
import com.apiaura.apiaura.request.dto.request.CreateApiRequestRequest;
import com.apiaura.apiaura.api.request.dto.response.ApiRequestResponse;
import com.apiaura.apiaura.request.enums.BodyType;
import com.apiaura.apiaura.request.enums.HttpMethod;
import com.apiaura.apiaura.api.request.service.ApiRequestService;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;

@Component
public class CreateApiRequestTool
        implements AiTool {

    private final ApiRequestService apiRequestService;

    public CreateApiRequestTool(
            ApiRequestService apiRequestService
    ) {
        this.apiRequestService =
                apiRequestService;
    }

    @Override
    public String getName() {
        return "create_api_request";
    }

    @Override
    public String getDescription() {

        return """
                Create a new API request inside an existing collection.
                The request can contain a name, HTTP method, URL,
                description and optional folder/parent request.
                """;
    }

    @Override
    public AiActionRisk getRisk() {
        return AiActionRisk.LOW;
    }

    @Override
    public Map<String, Object> getInputSchema() {

        return Map.of(
                "collectionId", "UUID - required",
                "name", "string - required",
                "method", "GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS",
                "url", "string - required",
                "description", "string - optional",
                "documentation", "string - optional",
                "bodyType", "NONE|JSON|FORM_DATA|URL_ENCODED|RAW|XML",
                "body", "string - optional",
                "enabled", "boolean",
                "folderId", "UUID - optional",
                "parentRequestId", "UUID - optional"
        );
    }

    @Override
    public AiToolResult execute(
            AiToolContext context,
            Map<String, Object> input
    ) {

        try {

            UUID collectionId =
                    UUID.fromString(
                            required(
                                    input,
                                    "collectionId"
                            )
                    );

            String name =
                    required(
                            input,
                            "name"
                    );

            String url =
                    required(
                            input,
                            "url"
                    );

            HttpMethod method =
                    parseEnum(
                            input,
                            "method",
                            HttpMethod.class,
                            HttpMethod.GET
                    );

            BodyType bodyType =
                    parseEnum(
                            input,
                            "bodyType",
                            BodyType.class,
                            BodyType.NONE
                    );

            String description =
                    optionalString(
                            input,
                            "description"
                    );

            String documentation =
                    optionalString(
                            input,
                            "documentation"
                    );

            String body =
                    optionalString(
                            input,
                            "body"
                    );

            boolean enabled =
                    optionalBoolean(
                            input,
                            "enabled",
                            true
                    );

            UUID folderId =
                    optionalUuid(
                            input,
                            "folderId"
                    );

            UUID parentRequestId =
                    optionalUuid(
                            input,
                            "parentRequestId"
                    );

            /*
             * This constructor follows the CreateApiRequest
             * structure already established in Apiaura.
             */
            CreateApiRequestRequest request =
                    new CreateApiRequestRequest(
                            name,
                            method,
                            url,
                            description,
                            documentation,
                            bodyType,
                            body,
                            enabled,
                            folderId,
                            parentRequestId
                    );

            /*
             * IMPORTANT:
             *
             * We intentionally call the service instead of
             * ApiRequestRepository.
             *
             * Therefore normal validation and workspace
             * authorization remain inside the application.
             */
            ApiRequestResponse response =
                    apiRequestService.create(
                            collectionId,
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

        Object value = input.get(key);

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

    private String optionalString(
            Map<String, Object> input,
            String key
    ) {

        Object value = input.get(key);

        if (value == null) {
            return null;
        }

        return value.toString();
    }

    private boolean optionalBoolean(
            Map<String, Object> input,
            String key,
            boolean defaultValue
    ) {

        Object value = input.get(key);

        if (value == null) {
            return defaultValue;
        }

        if (value instanceof Boolean booleanValue) {
            return booleanValue;
        }

        return Boolean.parseBoolean(
                value.toString()
        );
    }

    private UUID optionalUuid(
            Map<String, Object> input,
            String key
    ) {

        Object value = input.get(key);

        if (value == null) {
            return null;
        }

        return UUID.fromString(
                value.toString()
        );
    }

    private <T extends Enum<T>> T parseEnum(
            Map<String, Object> input,
            String key,
            Class<T> enumType,
            T defaultValue
    ) {

        Object value = input.get(key);

        if (value == null) {
            return defaultValue;
        }

        return Enum.valueOf(
                enumType,
                value.toString()
                        .trim()
                        .toUpperCase()
        );
    }
}