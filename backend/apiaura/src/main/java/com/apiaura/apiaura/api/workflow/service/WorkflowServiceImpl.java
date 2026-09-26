package com.apiaura.apiaura.api.workflow.service;

import com.apiaura.apiaura.api.workflow.entity.*;
import com.apiaura.apiaura.api.workflow.enums.WorkflowStatus;
import com.apiaura.apiaura.engine.execution.entity.RequestExecution;
import com.apiaura.apiaura.foundation.common.exception.BadRequestException;
import com.apiaura.apiaura.foundation.common.exception.ForbiddenException;
import com.apiaura.apiaura.foundation.common.exception.ResourceNotFoundException;
import com.apiaura.apiaura.foundation.common.security.SecurityUtils;
import com.apiaura.apiaura.api.environment.entity.Environment;
import com.apiaura.apiaura.api.environment.repository.EnvironmentRepository;
import com.apiaura.apiaura.engine.execution.dto.response.ApiExecutionResponse;
import com.apiaura.apiaura.engine.execution.service.ApiExecutionService;
import com.apiaura.apiaura.identity.user.entity.User;
import com.apiaura.apiaura.identity.user.repository.UserRepository;
import com.apiaura.apiaura.api.workflow.dto.request.ExecuteWorkflowRequest;
import com.apiaura.apiaura.api.workflow.dto.response.WorkflowExecutionResponse;
import com.apiaura.apiaura.workflow.entity.*;
import com.apiaura.apiaura.api.workflow.enums.WorkflowExecutionStatus;
import com.apiaura.apiaura.workflow.repository.*;
import com.apiaura.apiaura.org.workspace.repository.WorkspaceMemberRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.*;

@Service
@Transactional
public class WorkflowServiceImpl
        implements WorkflowService {

    private final WorkflowRepository workflowRepository;
    private final WorkflowExecutionRepository executionRepository;
    private final EnvironmentRepository environmentRepository;
    private final UserRepository userRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final ApiExecutionService apiExecutionService;
    private final ObjectMapper objectMapper;

    public WorkflowServiceImpl(
            WorkflowRepository workflowRepository,
            WorkflowExecutionRepository executionRepository,
            EnvironmentRepository environmentRepository,
            UserRepository userRepository,
            WorkspaceMemberRepository workspaceMemberRepository,
            ApiExecutionService apiExecutionService,
            ObjectMapper objectMapper
    ) {
        this.workflowRepository = workflowRepository;
        this.executionRepository = executionRepository;
        this.environmentRepository = environmentRepository;
        this.userRepository = userRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.apiExecutionService = apiExecutionService;
        this.objectMapper = objectMapper;
    }

    @Override
    public WorkflowExecutionResponse execute(
            UUID workflowId,
            ExecuteWorkflowRequest request
    ) {

        UUID userId =
                SecurityUtils.getCurrentUserId();

        User user =
                userRepository.findById(userId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "User not found"
                                )
                        );

        Workflow workflow =
                workflowRepository.findById(workflowId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Workflow not found"
                                )
                        );

        UUID workspaceId =
                workflow
                        .getWorkspace()
                        .getId();

        validateWorkspaceAccess(
                workspaceId,
                userId
        );

        if (workflow.getStatus()
                != WorkflowStatus.ACTIVE) {

            throw new BadRequestException(
                    "Workflow is not active"
            );
        }

        Environment environment =
                environmentRepository
                        .findByIdAndWorkspaceId(
                                request.environmentId(),
                                workspaceId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Environment not found"
                                )
                        );

        WorkflowExecution execution =
                new WorkflowExecution();

        execution.setWorkflow(workflow);
        execution.setEnvironment(environment);
        execution.setExecutedBy(user);
        execution.setStatus(
                WorkflowExecutionStatus.RUNNING
        );

        List<WorkflowStep> steps =
                workflow.getSteps()
                        .stream()
                        .filter(WorkflowStep::isEnabled)
                        .sorted(
                                Comparator.comparingInt(
                                        WorkflowStep::getSortOrder
                                )
                        )
                        .toList();

        execution.setTotalSteps(
                steps.size()
        );

        execution =
                executionRepository.save(execution);

        Map<String, String> variables =
                new HashMap<>();

        for (WorkflowVariable variable :
                workflow.getVariables()) {

            if (!variable.isEnabled()) {
                continue;
            }

            if (variable.isSecret()) {
                variables.put(
                        variable.getVariableKey(),
                        variable.getVariableValue()
                );
            } else {
                variables.put(
                        variable.getVariableKey(),
                        variable.getVariableValue()
                );
            }
        }

        Instant workflowStart =
                Instant.now();

        int completed = 0;
        int failed = 0;

        for (WorkflowStep step : steps) {

            Instant stepStart =
                    Instant.now();

            WorkflowStepExecution stepExecution =
                    new WorkflowStepExecution();

            stepExecution.setWorkflowExecution(
                    execution
            );

            stepExecution.setWorkflowStep(
                    step
            );

            stepExecution.setSortOrder(
                    step.getSortOrder()
            );

            try {

                ApiExecutionResponse result =
                        apiExecutionService.execute(
                                step.getRequest().getId(),
                                environment.getId(),
                                variables
                        );

                stepExecution.setRequestExecution(
                        findRequestExecution(
                                result.id()
                        )
                );

                boolean successful =
                        result.status() ==
                                com.apiaura.apiaura.foundation.common.enums.ExecutionStatus.SUCCESS;

                if (!successful) {

                    failed++;

                    stepExecution.setStatus(
                            WorkflowExecutionStatus.FAILED
                    );

                    stepExecution.setErrorMessage(
                            result.errorMessage() != null
                                    ? result.errorMessage()
                                    : "API request failed"
                    );

                    if (!step.isContinueOnFailure()) {

                        execution.setStatus(
                                WorkflowExecutionStatus.FAILED
                        );

                        break;
                    }

                } else {

                    completed++;

                    stepExecution.setStatus(
                            WorkflowExecutionStatus.SUCCESS
                    );

                    /*
                     * Extract a value from the response.
                     */
                    if (step.getExtractPath() != null
                            && !step
                            .getExtractPath()
                            .isBlank()
                            && step.getExtractVariable() != null
                            && !step
                            .getExtractVariable()
                            .isBlank()) {

                        String extracted =
                                extractJsonValue(
                                        result.responseBody(),
                                        step.getExtractPath()
                                );

                        if (extracted != null) {

                            variables.put(
                                    step.getExtractVariable(),
                                    extracted
                            );

                            stepExecution.setExtractedValue(
                                    extracted
                            );

                            stepExecution.setExtractedVariable(
                                    step.getExtractVariable()
                            );
                        }
                    }
                }

            } catch (Exception exception) {

                failed++;

                stepExecution.setStatus(
                        WorkflowExecutionStatus.FAILED
                );

                stepExecution.setErrorMessage(
                        exception.getMessage()
                );

                if (!step.isContinueOnFailure()) {

                    execution.setStatus(
                            WorkflowExecutionStatus.FAILED
                    );

                    stepExecution.setDurationMs(
                            Duration.between(
                                    stepStart,
                                    Instant.now()
                            ).toMillis()
                    );

                    execution
                            .getStepExecutions()
                            .add(stepExecution);

                    break;
                }
            }

            stepExecution.setDurationMs(
                    Duration.between(
                            stepStart,
                            Instant.now()
                    ).toMillis()
            );

            execution
                    .getStepExecutions()
                    .add(stepExecution);
        }

        execution.setCompletedSteps(
                completed
        );

        execution.setFailedSteps(
                failed
        );

        if (execution.getStatus()
                == WorkflowExecutionStatus.RUNNING) {

            execution.setStatus(
                    failed == 0
                            ? WorkflowExecutionStatus.SUCCESS
                            : WorkflowExecutionStatus.FAILED
            );
        }

        execution.setDurationMs(
                Duration.between(
                        workflowStart,
                        Instant.now()
                ).toMillis()
        );

        WorkflowExecution saved =
                executionRepository.save(execution);

        return WorkflowExecutionResponse.from(
                saved
        );
    }

    private String extractJsonValue(
            String body,
            String path
    ) {

        if (body == null ||
                body.isBlank()) {
            return null;
        }

        try {

            JsonNode node =
                    objectMapper.readTree(body);

            String normalized =
                    path.trim();

            if (normalized.startsWith("$.")) {
                normalized =
                        normalized.substring(2);
            } else if (normalized.startsWith("$")) {
                normalized =
                        normalized.substring(1);
            }

            if (normalized.isBlank()) {
                return node.toString();
            }

            for (String part :
                    normalized.split("\\.")) {

                if (part.isBlank()) {
                    continue;
                }

                if (part.matches("\\d+")) {

                    if (!node.isArray()) {
                        return null;
                    }

                    int index =
                            Integer.parseInt(part);

                    if (index >= node.size()) {
                        return null;
                    }

                    node = node.get(index);

                } else {

                    node = node.get(part);

                    if (node == null) {
                        return null;
                    }
                }
            }

            if (node.isTextual()) {
                return node.asText();
            }

            return node.toString();

        } catch (Exception exception) {

            throw new BadRequestException(
                    "Unable to extract workflow variable"
            );
        }
    }

    private RequestExecution
    findRequestExecution(UUID executionId) {

        /*
         * Replace with RequestExecutionRepository.findById()
         * through the repository dependency in the final implementation.
         *
         * This method is intentionally isolated so the workflow
         * service does not duplicate execution persistence logic.
         */
        throw new UnsupportedOperationException(
                "Inject RequestExecutionRepository here"
        );
    }

    private void validateWorkspaceAccess(
            UUID workspaceId,
            UUID userId
    ) {

        boolean member =
                workspaceMemberRepository
                        .existsByWorkspaceIdAndUserIdAndStatus(
                                workspaceId,
                                userId,
                                "ACTIVE"
                        );

        if (!member) {
            throw new ForbiddenException(
                    "You do not have access to this workspace"
            );
        }
    }
}
