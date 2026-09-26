package com.apiaura.apiaura.api.environment.service;

import com.apiaura.apiaura.foundation.common.exception.BadRequestException;
import com.apiaura.apiaura.foundation.common.exception.ForbiddenException;
import com.apiaura.apiaura.foundation.common.exception.ResourceNotFoundException;
import com.apiaura.apiaura.api.environment.dto.request.CreateEnvironmentRequest;
import com.apiaura.apiaura.api.environment.dto.request.UpdateEnvironmentRequest;
import com.apiaura.apiaura.api.environment.dto.response.EnvironmentResponse;
import com.apiaura.apiaura.api.environment.entity.Environment;
import com.apiaura.apiaura.environment.enums.EnvironmentStatus;
import com.apiaura.apiaura.api.environment.repository.EnvironmentRepository;
import com.apiaura.apiaura.identity.user.entity.User;
import com.apiaura.apiaura.identity.user.repository.UserRepository;
import com.apiaura.apiaura.org.workspace.entity.Workspace;
import com.apiaura.apiaura.org.workspace.entity.WorkspaceMember;
import com.apiaura.apiaura.org.workspace.repository.WorkspaceMemberRepository;
import com.apiaura.apiaura.org.workspace.repository.WorkspaceRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class EnvironmentServiceImpl implements EnvironmentService {

    private final EnvironmentRepository environmentRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;

    @Override
    public EnvironmentResponse create(
            UUID workspaceId,
            UUID userId,
            CreateEnvironmentRequest request
    ) {
        Workspace workspace = getWorkspace(workspaceId);

        ensureAccess(workspace, userId);

        String name = normalizeRequired(request.name());
        String slug = normalizeRequired(request.slug());

        if (environmentRepository.existsByWorkspaceIdAndSlug(
                workspaceId,
                slug
        )) {
            throw new BadRequestException(
                    "Environment slug already exists"
            );
        }

        if (environmentRepository.existsByWorkspaceIdAndNameIgnoreCase(
                workspaceId,
                name
        )) {
            throw new BadRequestException(
                    "Environment name already exists"
            );
        }

        User user = getUser(userId);

        boolean active = request.active() != null
                && request.active();

        if (active) {
            deactivateCurrentEnvironment(workspaceId);
        }

        Environment environment = new Environment();

        environment.setWorkspace(workspace);
        environment.setCreatedBy(user);
        environment.setName(name);
        environment.setSlug(slug);
        environment.setDescription(
                normalizeNullable(request.description())
        );
        environment.setStatus(EnvironmentStatus.ACTIVE);
        environment.setActive(active);

        return EnvironmentResponse.from(
                environmentRepository.save(environment)
        );
    }

    @Override
    @Transactional
    public EnvironmentResponse getById(
            UUID environmentId,
            UUID userId
    ) {
        Environment environment = getEnvironment(environmentId);

        ensureAccess(
                environment.getWorkspace(),
                userId
        );

        return EnvironmentResponse.from(environment);
    }

    @Override
    public Page<EnvironmentResponse> getByWorkspace(
            UUID workspaceId,
            UUID userId,
            Pageable pageable
    ) {
        Workspace workspace = getWorkspace(workspaceId);

        ensureAccess(workspace, userId);

        return environmentRepository
                .findByWorkspaceId(workspaceId, pageable)
                .map(EnvironmentResponse::from);
    }

    @Override
    public EnvironmentResponse update(
            UUID environmentId,
            UUID userId,
            UpdateEnvironmentRequest request
    ) {
        Environment environment = getEnvironment(environmentId);

        Workspace workspace = environment.getWorkspace();

        ensureAccess(workspace, userId);

        if (request.name() != null) {

            String name = normalizeRequired(request.name());

            if (!name.equalsIgnoreCase(environment.getName())
                    && environmentRepository
                    .existsByWorkspaceIdAndNameIgnoreCase(
                            workspace.getId(),
                            name
                    )) {
                throw new BadRequestException(
                        "Environment name already exists"
                );
            }

            environment.setName(name);
        }

        if (request.slug() != null) {

            String slug = normalizeRequired(request.slug());

            if (!slug.equals(environment.getSlug())
                    && environmentRepository
                    .existsByWorkspaceIdAndSlug(
                            workspace.getId(),
                            slug
                    )) {
                throw new BadRequestException(
                        "Environment slug already exists"
                );
            }

            environment.setSlug(slug);
        }

        if (request.description() != null) {
            environment.setDescription(
                    normalizeNullable(request.description())
            );
        }

        if (request.status() != null) {
            environment.setStatus(request.status());

            if (request.status() == EnvironmentStatus.INACTIVE) {
                environment.setActive(false);
            }
        }

        if (Boolean.TRUE.equals(request.active())) {
            deactivateCurrentEnvironment(
                    workspace.getId(),
                    environment.getId()
            );

            environment.setActive(true);
            environment.setStatus(EnvironmentStatus.ACTIVE);
        }

        if (Boolean.FALSE.equals(request.active())) {
            environment.setActive(false);
        }

        return EnvironmentResponse.from(
                environmentRepository.save(environment)
        );
    }

    @Override
    public EnvironmentResponse activate(
            UUID environmentId,
            UUID userId
    ) {
        Environment environment = getEnvironment(environmentId);

        ensureAccess(
                environment.getWorkspace(),
                userId
        );

        deactivateCurrentEnvironment(
                environment.getWorkspace().getId(),
                environment.getId()
        );

        environment.setActive(true);
        environment.setStatus(EnvironmentStatus.ACTIVE);

        return EnvironmentResponse.from(
                environmentRepository.save(environment)
        );
    }

    @Override
    public EnvironmentResponse deactivate(
            UUID environmentId,
            UUID userId
    ) {
        Environment environment = getEnvironment(environmentId);

        ensureAccess(
                environment.getWorkspace(),
                userId
        );

        environment.setActive(false);

        return EnvironmentResponse.from(
                environmentRepository.save(environment)
        );
    }

    @Override
    public void delete(
            UUID environmentId,
            UUID userId
    ) {
        Environment environment = getEnvironment(environmentId);

        ensureAccess(
                environment.getWorkspace(),
                userId
        );

        environmentRepository.delete(environment);
    }

    private void deactivateCurrentEnvironment(
            UUID workspaceId
    ) {
        environmentRepository
                .findByWorkspaceIdAndActiveTrue(workspaceId)
                .ifPresent(environment -> {
                    environment.setActive(false);
                });
    }

    private void deactivateCurrentEnvironment(
            UUID workspaceId,
            UUID excludedEnvironmentId
    ) {
        environmentRepository
                .findByWorkspaceIdAndActiveTrue(workspaceId)
                .filter(environment ->
                        !environment.getId()
                                .equals(excludedEnvironmentId)
                )
                .ifPresent(environment ->
                        environment.setActive(false)
                );
    }

    private Workspace getWorkspace(UUID workspaceId) {
        return workspaceRepository
                .findById(workspaceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Workspace not found"
                        )
                );
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

    private User getUser(UUID userId) {
        return userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
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
                    "Required value cannot be blank"
            );
        }

        return value.trim();
    }

    private String normalizeNullable(String value) {
        return StringUtils.hasText(value)
                ? value.trim()
                : null;
    }
}
