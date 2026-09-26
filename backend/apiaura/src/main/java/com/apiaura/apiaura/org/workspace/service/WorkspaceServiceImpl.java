package com.apiaura.apiaura.org.workspace.service;

import com.apiaura.apiaura.foundation.common.enums.WorkspaceStatus;
import com.apiaura.apiaura.foundation.common.exception.BadRequestException;
import com.apiaura.apiaura.foundation.common.exception.ResourceNotFoundException;
import com.apiaura.apiaura.org.organization.entity.Organization;
import com.apiaura.apiaura.org.organization.repository.OrganizationRepository;
import com.apiaura.apiaura.identity.user.entity.User;
import com.apiaura.apiaura.identity.user.repository.UserRepository;
import com.apiaura.apiaura.org.workspace.dto.request.CreateWorkspaceRequest;
import com.apiaura.apiaura.org.workspace.dto.request.UpdateWorkspaceRequest;
import com.apiaura.apiaura.org.workspace.dto.response.WorkspaceResponse;
import com.apiaura.apiaura.org.workspace.entity.Workspace;
import com.apiaura.apiaura.org.workspace.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WorkspaceServiceImpl
        implements WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public WorkspaceResponse create(
            UUID organizationId,
            UUID createdBy,
            CreateWorkspaceRequest request
    ) {

        if (workspaceRepository.existsByOrganizationIdAndSlug(
                organizationId,
                request.getSlug()
        )) {
            throw new BadRequestException(
                    "Workspace slug already exists"
            );
        }

        Organization organization =
                organizationRepository.findById(organizationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Organization not found"
                                )
                        );

        User creator = userRepository.findById(createdBy)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        )
                );

        Workspace workspace = new Workspace();

        workspace.setOrganization(organization);
        workspace.setName(request.getName());
        workspace.setSlug(request.getSlug());
        workspace.setDescription(request.getDescription());
        workspace.setCreatedBy(creator);
        workspace.setStatus(WorkspaceStatus.ACTIVE);

        return WorkspaceResponse.from(
                workspaceRepository.save(workspace)
        );
    }

    @Override
    public WorkspaceResponse getById(UUID workspaceId) {
        return WorkspaceResponse.from(
                findWorkspace(workspaceId)
        );
    }

    @Override
    public List<WorkspaceResponse> getByOrganization(
            UUID organizationId
    ) {
        return workspaceRepository
                .findByOrganizationId(organizationId)
                .stream()
                .map(WorkspaceResponse::from)
                .toList();
    }

    @Override
    public List<WorkspaceResponse> getByUser(
            UUID userId
    ) {
        return workspaceRepository
                .findByCreatedById(userId)
                .stream()
                .map(WorkspaceResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public WorkspaceResponse update(
            UUID workspaceId,
            UpdateWorkspaceRequest request
    ) {

        Workspace workspace = findWorkspace(workspaceId);

        if (request.getSlug() != null &&
                !request.getSlug().equals(workspace.getSlug()) &&
                workspaceRepository
                        .existsByOrganizationIdAndSlug(
                                workspace.getOrganization().getId(),
                                request.getSlug()
                        )) {

            throw new BadRequestException(
                    "Workspace slug already exists"
            );
        }

        if (request.getName() != null) {
            workspace.setName(request.getName());
        }

        if (request.getSlug() != null) {
            workspace.setSlug(request.getSlug());
        }

        if (request.getDescription() != null) {
            workspace.setDescription(
                    request.getDescription()
            );
        }

        if (request.getStatus() != null) {
            workspace.setStatus(request.getStatus());
        }

        return WorkspaceResponse.from(
                workspaceRepository.save(workspace)
        );
    }

    @Override
    @Transactional
    public void delete(UUID workspaceId) {

        Workspace workspace = findWorkspace(workspaceId);

        workspaceRepository.delete(workspace);
    }

    private Workspace findWorkspace(UUID workspaceId) {

        return workspaceRepository.findById(workspaceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Workspace not found: " + workspaceId
                        )
                );
    }
}
