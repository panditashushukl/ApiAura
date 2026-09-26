package com.apiaura.apiaura.engine.execution.service;

import com.apiaura.apiaura.api.collection.entity.CollectionVariable;
import com.apiaura.apiaura.api.request.entity.ApiRequest;
import com.apiaura.apiaura.api.request.entity.PathParameter;
import com.apiaura.apiaura.api.request.entity.QueryParameter;
import com.apiaura.apiaura.api.request.entity.RequestHeader;
import com.apiaura.apiaura.foundation.common.exception.BadRequestException;
import com.apiaura.apiaura.foundation.common.exception.ForbiddenException;
import com.apiaura.apiaura.foundation.common.exception.ResourceNotFoundException;
import com.apiaura.apiaura.foundation.common.security.SecurityUtils;
import com.apiaura.apiaura.api.environment.entity.Environment;
import com.apiaura.apiaura.api.environment.entity.EnvironmentVariable;
import com.apiaura.apiaura.api.environment.repository.EnvironmentRepository;
import com.apiaura.apiaura.engine.execution.dto.request.ExecuteApiRequest;
import com.apiaura.apiaura.engine.execution.dto.response.ApiExecutionResponse;
import com.apiaura.apiaura.engine.execution.entity.RequestExecution;
import com.apiaura.apiaura.foundation.common.enums.ExecutionStatus;
import com.apiaura.apiaura.engine.execution.repository.RequestExecutionRepository;
import com.apiaura.apiaura.engine.execution.security.UrlSecurityValidator;
import com.apiaura.apiaura.engine.execution.util.VariableResolver;
import com.apiaura.apiaura.api.request.repository.ApiRequestRepository;
import com.apiaura.apiaura.engine.scripting.dto.ScriptExecutionContext;
import com.apiaura.apiaura.engine.scripting.dto.ScriptExecutionResult;
import com.apiaura.apiaura.engine.scripting.service.ScriptExecutionService;
import com.apiaura.apiaura.identity.user.entity.User;
import com.apiaura.apiaura.identity.user.repository.UserRepository;
import com.apiaura.apiaura.org.workspace.repository.WorkspaceMemberRepository;
import tools.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.net.URI;
import java.net.http.*;
import java.time.Duration;
import java.time.Instant;
import java.util.*;

@Service
@Transactional
public class ApiExecutionServiceImpl implements ApiExecutionService {

    private static final Duration REQUEST_TIMEOUT =
            Duration.ofSeconds(30);

    private final ApiRequestRepository apiRequestRepository;
    private final EnvironmentRepository environmentRepository;
    private final RequestExecutionRepository executionRepository;
    private final UserRepository userRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final ObjectMapper objectMapper;
    private final UrlSecurityValidator urlSecurityValidator;
    private final ScriptExecutionService scriptExecutionService;

    private final HttpClient httpClient;

    public ApiExecutionServiceImpl(
            ApiRequestRepository apiRequestRepository,
            EnvironmentRepository environmentRepository,
            RequestExecutionRepository executionRepository,
            UserRepository userRepository,
            WorkspaceMemberRepository workspaceMemberRepository,
            UrlSecurityValidator urlSecurityValidator,
            ScriptExecutionService scriptExecutionService,
            ObjectMapper objectMapper
    ) {
        this.apiRequestRepository = apiRequestRepository;
        this.environmentRepository = environmentRepository;
        this.executionRepository = executionRepository;
        this.userRepository = userRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.objectMapper = objectMapper;
        this.urlSecurityValidator = urlSecurityValidator;
        this.scriptExecutionService = scriptExecutionService;

        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();
    }

    @Override
    public ApiExecutionResponse execute(
            UUID requestId,
            ExecuteApiRequest executeRequest
    ) {

        UUID userId = SecurityUtils.getCurrentUserId();

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found")
                );

        ApiRequest apiRequest =
                apiRequestRepository.findDetailedById(requestId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "API request not found"
                                )
                        );

        validateWorkspaceAccess(
                apiRequest.getCollection().getWorkspace().getId(),
                userId
        );

        if (!apiRequest.isEnabled()) {
            throw new BadRequestException(
                    "API request is disabled"
            );
        }

        Environment environment =
                environmentRepository
                        .findByIdAndWorkspaceId(
                                executeRequest.environmentId(),
                                apiRequest
                                        .getCollection()
                                        .getWorkspace()
                                        .getId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Environment not found"
                                )
                        );

        return executeRequest(
                apiRequest,
                environment,
                user
        );
    }

    private ApiExecutionResponse executeRequest(
            ApiRequest apiRequest,
            Environment environment,
            User user
    ) {

        RequestExecution execution =
                new RequestExecution();

        execution.setRequest(apiRequest);
        execution.setEnvironment(environment);
        execution.setExecutedBy(user);
        execution.setMethod(
                apiRequest.getMethod().name()
        );

        Instant start = Instant.now();

        try {

            Map<String, String> variables =
                    buildVariables(apiRequest, environment);

            ScriptExecutionContext preContext =
                    ScriptExecutionContext.builder()
                            .variables(variables)
                            .requestUrl(
                                    VariableResolver.resolve(
                                            apiRequest.getUrl(),
                                            variables
                                    )
                            )
                            .requestMethod(
                                    apiRequest.getMethod().name()
                            )
                            .requestHeaders(
                                    Map.of()
                            )
                            .requestBody(
                                    VariableResolver.resolve(
                                            apiRequest.getBody(),
                                            variables
                                    )
                            )
                            .build();

            if (apiRequest.getPreRequestScript() != null
                    && apiRequest
                    .getPreRequestScript()
                    .isEnabled()) {

                ScriptExecutionResult result =
                        scriptExecutionService
                                .executePreRequestScript(
                                        apiRequest
                                                .getPreRequestScript()
                                                .getScript(),
                                        preContext
                                );

                if (!result.isSuccessful()) {

                    execution.setStatus(
                            ExecutionStatus.FAILED
                    );

                    execution.setErrorMessage(
                            "Pre-request script failed: "
                                    + result.getErrorMessage()
                    );

                    execution.setDurationMs(0L);

                    return ApiExecutionResponse.from(
                            executionRepository.save(
                                    execution
                            )
                    );
                }

                variables =
                        result.getVariables();
            }

            String url = buildUrl(
                    apiRequest,
                    variables
            );

            execution.setResolvedUrl(url);

            urlSecurityValidator.validate(url);

            Map<String, String> headers =
                    buildHeaders(
                            apiRequest,
                            variables
                    );

            applyAuthentication(
                    apiRequest,
                    headers,
                    variables
            );

            String requestBody =
                    VariableResolver.resolve(
                            apiRequest.getBody(),
                            variables
                    );

            execution.setRequestHeaders(
                    serialize(headers)
            );

            execution.setRequestBody(
                    requestBody
            );

            HttpRequest.Builder requestBuilder =
                    HttpRequest.newBuilder()
                            .uri(URI.create(url))
                            .timeout(REQUEST_TIMEOUT);

            Map<String, Object> responseHeaders =
                    new LinkedHashMap<>();

            response.headers()
                    .map()
                    .forEach(
                            (key, values) ->
                                    responseHeaders.put(
                                            key,
                                            values
                                    )
                    );

            ScriptExecutionContext postContext =
                    ScriptExecutionContext.builder()
                            .variables(variables)
                            .requestUrl(url)
                            .requestMethod(
                                    apiRequest.getMethod().name()
                            )
                            .requestHeaders(headers)
                            .requestBody(requestBody)
                            .responseStatus(
                                    response.statusCode()
                            )
                            .responseHeaders(responseHeaders)
                            .responseBody(response.body())
                            .build();

            if (apiRequest.getPostRequestScript() != null
                    && apiRequest
                    .getPostRequestScript()
                    .isEnabled()) {

                ScriptExecutionResult result =
                        scriptExecutionService
                                .executePostRequestScript(
                                        apiRequest
                                                .getPostRequestScript()
                                                .getScript(),
                                        postContext
                                );

                if (!result.isSuccessful()) {

                    execution.setErrorMessage(
                            "Post-request script failed: "
                                    + result.getErrorMessage()
                    );
                }
            }

            headers.forEach(
                    (key, value) ->
                            requestBuilder.header(
                                    key,
                                    value
                            )
            );

            HttpRequest.BodyPublisher bodyPublisher =
                    createBodyPublisher(
                            apiRequest,
                            requestBody
                    );

            requestBuilder.method(
                    apiRequest.getMethod().name(),
                    bodyPublisher
            );

            HttpResponse<String> response =
                    httpClient.send(
                            requestBuilder.build(),
                            HttpResponse.BodyHandlers.ofString()
                    );

            long duration =
                    Duration.between(
                            start,
                            Instant.now()
                    ).toMillis();

            execution.setResponseStatus(
                    response.statusCode()
            );

            execution.setResponseHeaders(
                    serializeResponseHeaders(
                            response.headers()
                                    .map()
                    )
            );

            execution.setResponseBody(
                    response.body()
            );

            execution.setResponseSizeBytes(
                    (long) response.body()
                            .getBytes()
                            .length
            );

            execution.setDurationMs(duration);

            execution.setStatus(
                    resolveStatus(response.statusCode())
            );

        } catch (HttpTimeoutException exception) {

            execution.setStatus(
                    ExecutionStatus.TIMEOUT
            );

            execution.setErrorMessage(
                    "Request timed out"
            );

            execution.setDurationMs(
                    Duration.between(
                            start,
                            Instant.now()
                    ).toMillis()
            );

        } catch (IOException exception) {

            execution.setStatus(
                    ExecutionStatus.NETWORK_ERROR
            );

            execution.setErrorMessage(
                    exception.getMessage()
            );

            execution.setDurationMs(
                    Duration.between(
                            start,
                            Instant.now()
                    ).toMillis()
            );

        } catch (InterruptedException exception) {

            Thread.currentThread().interrupt();

            execution.setStatus(
                    ExecutionStatus.FAILED
            );

            execution.setErrorMessage(
                    "Request execution interrupted"
            );

            execution.setDurationMs(
                    Duration.between(
                            start,
                            Instant.now()
                    ).toMillis()
            );

        } catch (Exception exception) {

            execution.setStatus(
                    ExecutionStatus.FAILED
            );

            execution.setErrorMessage(
                    exception.getMessage()
            );

            execution.setDurationMs(
                    Duration.between(
                            start,
                            Instant.now()
                    ).toMillis()
            );
        }

        RequestExecution saved =
                executionRepository.save(execution);

        return ApiExecutionResponse.from(saved);
    }

    private Map<String, String> buildVariables(
            ApiRequest apiRequest,
            Environment environment
    ) {

        Collection<CollectionVariable> collectionVariables =
                apiRequest
                        .getCollection()
                        .getVariables();

        Collection<EnvironmentVariable> environmentVariables =
                environment.getVariables();

        return VariableResolver.buildVariables(
                collectionVariables,
                environmentVariables
        );
    }

    private String buildUrl(
            ApiRequest request,
            Map<String, String> variables
    ) {

        String url =
                VariableResolver.resolve(
                        request.getUrl(),
                        variables
                );

        /*
         * Path parameters
         */
        if (request.getPathParameters() != null) {

            for (PathParameter parameter :
                    request.getPathParameters()) {

                if (!parameter.isEnabled()) {
                    continue;
                }

                String value =
                        VariableResolver.resolve(
                                parameter.getParamValue(),
                                variables
                        );

                url = url.replace(
                        "{" + parameter.getParamKey() + "}",
                        value
                );
            }
        }

        /*
         * Query parameters
         */
        List<String> queryParams =
                new ArrayList<>();

        if (request.getQueryParameters() != null) {

            for (QueryParameter parameter :
                    request.getQueryParameters()) {

                if (!parameter.isEnabled()) {
                    continue;
                }

                String key =
                        parameter.getParamKey();

                String value =
                        VariableResolver.resolve(
                                parameter.getParamValue(),
                                variables
                        );

                queryParams.add(
                        encode(key) +
                                "=" +
                                encode(value)
                );
            }
        }

        if (!queryParams.isEmpty()) {

            String separator =
                    url.contains("?")
                            ? "&"
                            : "?";

            url += separator +
                    String.join("&", queryParams);
        }

        URI uri;

        try {
            uri = URI.create(url);
        } catch (IllegalArgumentException exception) {
            throw new BadRequestException(
                    "Invalid request URL"
            );
        }

        String scheme = uri.getScheme();

        if (!"http".equalsIgnoreCase(scheme)
                && !"https".equalsIgnoreCase(scheme)) {

            throw new BadRequestException(
                    "Only HTTP and HTTPS URLs are supported"
            );
        }

        return url;
    }

    private Map<String, String> buildHeaders(
            ApiRequest request,
            Map<String, String> variables
    ) {

        Map<String, String> headers =
                new LinkedHashMap<>();

        if (request.getHeaders() == null) {
            return headers;
        }

        for (RequestHeader header :
                request.getHeaders()) {

            if (!header.isEnabled()) {
                continue;
            }

            String key =
                    header.getHeaderKey();

            String value =
                    VariableResolver.resolve(
                            header.getHeaderValue(),
                            variables
                    );

            headers.put(key, value);
        }

        return headers;
    }

    private void applyAuthentication(
            ApiRequest request,
            Map<String, String> headers,
            Map<String, String> variables
    ) {

        if (request.getRequestAuth() == null) {
            return;
        }

        if (request.getRequestAuth().getAuthConfig() == null) {
            return;
        }

        var authConfig =
                request.getRequestAuth()
                        .getAuthConfig();

        if (authConfig.getAuthType() == null) {
            return;
        }

        String configJson =
                authConfig.getConfigJson();

        if (configJson == null ||
                configJson.isBlank()) {
            return;
        }

        try {

            Map<String, Object> config =
                    objectMapper.readValue(
                            configJson,
                            Map.class
                    );

            switch (authConfig.getAuthType()) {

                case BASIC -> applyBasicAuth(
                        config,
                        headers,
                        variables
                );

                case BEARER -> applyBearerAuth(
                        config,
                        headers,
                        variables
                );

                case API_KEY -> applyApiKeyAuth(
                        config,
                        headers,
                        variables
                );

                case NONE -> {
                }

                case OAUTH2 ->
                        throw new BadRequestException(
                                "OAuth2 execution is not implemented yet"
                        );
            }

        } catch (JsonProcessingException exception) {

            throw new BadRequestException(
                    "Invalid authentication configuration"
            );
        }
    }

    private void applyBasicAuth(
            Map<String, Object> config,
            Map<String, String> headers,
            Map<String, String> variables
    ) {

        String username =
                resolveConfigValue(
                        config.get("username"),
                        variables
                );

        String password =
                resolveConfigValue(
                        config.get("password"),
                        variables
                );

        String credentials =
                username + ":" + password;

        String encoded =
                Base64.getEncoder()
                        .encodeToString(
                                credentials.getBytes()
                        );

        headers.put(
                "Authorization",
                "Basic " + encoded
        );
    }

    private void applyBearerAuth(
            Map<String, Object> config,
            Map<String, String> headers,
            Map<String, String> variables
    ) {

        String token =
                resolveConfigValue(
                        config.get("token"),
                        variables
                );

        headers.put(
                "Authorization",
                "Bearer " + token
        );
    }

    private void applyApiKeyAuth(
            Map<String, Object> config,
            Map<String, String> headers,
            Map<String, String> variables
    ) {

        String key =
                resolveConfigValue(
                        config.get("key"),
                        variables
                );

        String value =
                resolveConfigValue(
                        config.get("value"),
                        variables
                );

        String location =
                resolveConfigValue(
                        config.get("location"),
                        variables
                );

        if ("query".equalsIgnoreCase(location)) {
            /*
             * Query based API keys should eventually be handled
             * by the URL builder.
             */
            throw new BadRequestException(
                    "Query API key authentication is not supported yet"
            );
        }

        headers.put(key, value);
    }

    private String resolveConfigValue(
            Object value,
            Map<String, String> variables
    ) {

        if (value == null) {
            return "";
        }

        return VariableResolver.resolve(
                String.valueOf(value),
                variables
        );
    }

    private HttpRequest.BodyPublisher createBodyPublisher(
            ApiRequest request,
            String body
    ) {

        if (body == null ||
                body.isBlank() ||
                request.getBodyType() == null ||
                request.getBodyType().name().equals("NONE")) {

            return HttpRequest.BodyPublishers.noBody();
        }

        return HttpRequest.BodyPublishers.ofString(body);
    }

    private ExecutionStatus resolveStatus(
            int statusCode
    ) {

        if (statusCode >= 200 &&
                statusCode < 300) {

            return ExecutionStatus.SUCCESS;
        }

        if (statusCode >= 400 &&
                statusCode < 500) {

            return ExecutionStatus.CLIENT_ERROR;
        }

        if (statusCode >= 500) {

            return ExecutionStatus.SERVER_ERROR;
        }

        return ExecutionStatus.FAILED;
    }

    private String serialize(
            Map<String, String> values
    ) {

        try {

            return objectMapper.writeValueAsString(
                    values
            );

        } catch (JsonProcessingException exception) {

            return "{}";
        }
    }

    private String serializeResponseHeaders(
            Map<String, List<String>> headers
    ) {

        try {

            return objectMapper.writeValueAsString(
                    headers
            );

        } catch (JsonProcessingException exception) {

            return "{}";
        }
    }

    private String encode(String value) {

        try {

            return java.net.URLEncoder.encode(
                    value == null ? "" : value,
                    java.nio.charset.StandardCharsets.UTF_8
            );

        } catch (Exception exception) {

            return value;
        }
    }

    private void validateWorkspaceAccess(
            UUID workspaceId,
            UUID userId
    ) {

        boolean isMember =
                workspaceMemberRepository
                        .existsByWorkspaceIdAndUserIdAndStatus(
                                workspaceId,
                                userId,
                                "ACTIVE"
                        );

        if (!isMember) {
            throw new ForbiddenException(
                    "You do not have access to this workspace"
            );
        }
    }
}
