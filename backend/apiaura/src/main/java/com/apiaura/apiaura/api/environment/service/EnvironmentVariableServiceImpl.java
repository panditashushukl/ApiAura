package com.apiaura.apiaura.api.environment.service;

import com.apiaura.apiaura.foundation.common.exception.BadRequestException;
import com.apiaura.apiaura.foundation.common.exception.ForbiddenException;
import com.apiaura.apiaura.foundation.common.exception.ResourceNotFoundException;
import com.apiaura.apiaura.api.environment.dto.request.CreateEnvironmentVariableRequest;
import com.apiaura.apiaura.api.environment.dto.request.UpdateEnvironmentVariableRequest;
import com.apiaura.apiaura.api.environment.dto.response.EnvironmentVariableResponse;
import com.apiaura.apiaura.api.environment.entity.Environment;
import com.apiaura.apiaura.api.environment.entity.EnvironmentVariable;
import com.apiaura.apiaura.api.environment.repository.EnvironmentRepository;
import com.apiaura.apiaura.api.environment.repository.EnvironmentVariableRepository;
import com.apiaura.apiaura.org.workspace.entity.Workspace;
import com.apiaura.apiaura.org.workspace.entity.WorkspaceMember;
import com.apiaura.apiaura.org.workspace.repository.WorkspaceMemberRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class EnvironmentVariableServiceImpl
        implements EnvironmentVariableService {

    private final EnvironmentVariableRepository variableRepository;
    private final EnvironmentRepository environmentRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;

    @Override
    @Transactional
    public List<EnvironmentVariableResponse> getByEnvironment(
            UUID environmentId,
            UUID userId
    ) {
        Environment environment = getEnvironment(environmentId);

        ensureAccess(environment.getWorkspace(), userId);

        return variableRepository
                .findByEnvironmentIdOrderByVariableKeyAsc(
                        environmentId
                )
                .stream()
                .map(EnvironmentVariableResponse::from)
                .toList();
    }

    @Override
    public EnvironmentVariableResponse getById(
            UUID environmentId,
            UUID variableId,
            UUID userId
    ) {
        Environment environment = getEnvironment(environmentId);

        ensureAccess(environment.getWorkspace(), userId);

        EnvironmentVariable variable =
                variableRepository
                        .findByIdAndEnvironmentId(
                                variableId,
                                environmentId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Environment variable not found"
                                )
                        );

        return EnvironmentVariableResponse.from(variable);
    }

    @Override
    public EnvironmentVariableResponse create(
            UUID environmentId,
            UUID userId,
            CreateEnvironmentVariableRequest request
    ) {
        Environment environment = getEnvironment(environmentId);

        ensureAccess(environment.getWorkspace(), userId);

        String key = normalizeRequired(request.variableKey());

        if (variableRepository.existsByEnvironmentIdAndVariableKey(
                environmentId,
                key
        )) {
            throw new BadRequestException(
                    "Environment variable already exists"
            );
        }

        boolean secret =
                request.secret() != null && request.secret();

        if (secret && !StringUtils.hasText(request.secretValue())) {
            throw new BadRequestException(
                    "Secret value is required for a secret variable"
            );
        }

        if (!secret && request.secretValue() != null) {
            throw new BadRequestException(
                    "Secret value can only be used for secret variables"
            );
        }

        EnvironmentVariable variable =
                new EnvironmentVariable();

        variable.setEnvironment(environment);
        variable.setVariableKey(key);
        variable.setSecret(secret);
        variable.setEnabled(
                request.enabled() == null || request.enabled()
        );

        if (secret) {
            variable.setSecretValue(
                    request.secretValue()
            );
            variable.setVariableValue(null);
        } else {
            variable.setVariableValue(
                    request.variableValue()
            );
            variable.setSecretValue(null);
        }

        return EnvironmentVariableResponse.from(
                variableRepository.save(variable)
        );
    }

    @Override
    public EnvironmentVariableResponse update(
            UUID environmentId,
            UUID variableId,
            UUID userId,
            UpdateEnvironmentVariableRequest request
    ) {
        Environment environment = getEnvironment(environmentId);

        ensureAccess(environment.getWorkspace(), userId);

        EnvironmentVariable variable =
                variableRepository
                        .findByIdAndEnvironmentId(
                                variableId,
                                environmentId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Environment variable not found"
                                )
                        );

        if (request.variableKey() != null) {

            String key = normalizeRequired(
                    request.variableKey()
            );

            if (!key.equals(variable.getVariableKey())
                    && variableRepository
                    .existsByEnvironmentIdAndVariableKey(
                            environmentId,
                            key
                    )) {
                throw new BadRequestException(
                        "Environment variable already exists"
                );
            }

            variable.setVariableKey(key);
        }

        if (request.secret() != null) {

            boolean secret = request.secret();

            if (secret) {

                if (StringUtils.hasText(
                        request.secretValue()
                )) {
                    variable.setSecretValue(
                            request.secretValue()
                    );
                }

                if (!StringUtils.hasText(
                        variable.getSecretValue()
                )) {
                    throw new BadRequestException(
                            "Secret value is required"
                    );
                }

                variable.setVariableValue(null);

            } else {

                if (request.variableValue() != null) {
                    variable.setVariableValue(
                            request.variableValue()
                    );
                }

                variable.setSecretValue(null);
            }

            variable.setSecret(secret);

        } else {

            if (variable.isSecret()) {

                if (request.secretValue() != null) {
                    variable.setSecretValue(
                            request.secretValue()
                    );
                }

            } else if (request.variableValue() != null) {

                variable.setVariableValue(
                        request.variableValue()
                );
            }
        }

        if (request.enabled() != null) {
            variable.setEnabled(request.enabled());
        }

        return EnvironmentVariableResponse.from(
                variableRepository.save(variable)
        );
    }

    @Override
    public void delete(
            UUID environmentId,
            UUID variableId,
            UUID userId
    ) {
        Environment environment = getEnvironment(environmentId);

        ensureAccess(environment.getWorkspace(), userId);

        EnvironmentVariable variable =
                variableRepository
                        .findByIdAndEnvironmentId(
                                variableId,
                                environmentId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Environment variable not found"
                                )
                        );

        variableRepository.delete(variable);
    }

    private Environment getEnvironment(UUID environmentId) {
        return environmentRepository
                .findById(environmentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Environment not found"
                        )
                );
    }

    private void ensureAccess(
            Workspace workspace,
            UUID userId
    ) {
        if (workspace.getCreatedBy().getId().equals(userId)) {
            return;
        }

        WorkspaceMember member =
                workspaceMemberRepository
                        .findByWorkspaceIdAndUserId(
                                workspace.getId(),
                                userId
                        )
                        .orElseThrow(() ->
                                new ForbiddenException(
                                        "You do not have access to this workspace"
                                )
                        );

        if (!"ACTIVE".equalsIgnoreCase(member.getStatus())) {
            throw new ForbiddenException(
                    "Your workspace membership is not active"
            );
        }
    }

    private String normalizeRequired(String value) {
        if (!StringUtils.hasText(value)) {
            throw new BadRequestException(
                    "Variable key cannot be blank"
            );
        }

        return value.trim();
    }
}
