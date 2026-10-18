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

import com.apiaura.apiaura.org.workspace.entity.WorkspaceMember;
import com.apiaura.apiaura.org.workspace.repository.WorkspaceMemberRepository;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WorkspaceServiceImpl
        implements WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;

    @Override
    @Transactional
    public WorkspaceResponse create(
            UUID organizationId,
            UUID createdBy,
            CreateWorkspaceRequest request
    ) {
        Organization organization = null;
        if (organizationId != null) {
            if (workspaceRepository.existsByOrganizationIdAndSlug(
                    organizationId,
                    request.getSlug()
            )) {
                throw new BadRequestException(
                        "Workspace slug already exists in this organization"
                );
            }
            organization = organizationRepository.findById(organizationId)
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Organization not found"
                            )
                    );
        } else {
            if (workspaceRepository.existsByCreatedByIdAndSlug(
                    createdBy,
                    request.getSlug()
            )) {
                throw new BadRequestException(
                        "Workspace slug already exists"
                );
            }
        }

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

        workspace = workspaceRepository.save(workspace);

        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspace.getId(), creator.getId())) {
            WorkspaceMember member = new WorkspaceMember();
            member.setWorkspace(workspace);
            member.setUser(creator);
            member.setInvitedBy(creator);
            member.setStatus("ACTIVE");
            member.setJoinedAt(java.time.Instant.now());
            workspaceMemberRepository.save(member);
        }

        return WorkspaceResponse.from(workspace);
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
    public List<WorkspaceResponse> getAll() {
        return workspaceRepository.findAll()
                .stream()
                .map(WorkspaceResponse::from)
                .toList();
    }

    @Override
    public List<WorkspaceResponse> getByUser(
            UUID userId
    ) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return List.of();
        }

        boolean isSuperAdmin = false;
        boolean isOrgAdmin = false;
        try {
            if (user.getRoles() != null) {
                isSuperAdmin = user.getRoles().stream()
                        .filter(ur -> ur.getRole() != null && ur.getRole().getCode() != null)
                        .anyMatch(ur -> ur.getRole().getCode().equalsIgnoreCase("SUPER_ADMIN"));
                isOrgAdmin = user.getRoles().stream()
                        .filter(ur -> ur.getRole() != null && ur.getRole().getCode() != null)
                        .anyMatch(ur -> ur.getRole().getCode().equalsIgnoreCase("ADMIN"));
            }
            if (user.getOrganization() != null && user.getOrganization().getOwner() != null && user.getOrganization().getOwner().getId().equals(userId)) {
                isOrgAdmin = true;
            }
        } catch (Exception ignored) {
        }

        if (isSuperAdmin) {
            return getAll();
        }

        List<Workspace> list;
        if (isOrgAdmin && user.getOrganization() != null) {
            list = workspaceRepository.findByCreatedByIdOrOrganizationId(
                    userId,
                    user.getOrganization().getId()
            );
        } else {
            List<Workspace> createdWorkspaces = workspaceRepository.findByCreatedById(userId);
            List<WorkspaceMember> memberRecords = workspaceMemberRepository.findByUserId(userId);
            List<Workspace> memberWorkspaces = memberRecords.stream()
                    .map(WorkspaceMember::getWorkspace)
                    .filter(w -> w != null)
                    .toList();

            list = new java.util.ArrayList<>(createdWorkspaces);
            list.addAll(memberWorkspaces);
        }

        return list.stream()
                .distinct()
                .map(WorkspaceResponse::from)
                .toList();
    }

    @Override
    public List<WorkspaceResponse> getByUserSpecific(UUID userId) {
        List<Workspace> createdWorkspaces = workspaceRepository.findByCreatedById(userId);
        List<WorkspaceMember> memberRecords = workspaceMemberRepository.findByUserId(userId);
        List<Workspace> memberWorkspaces = memberRecords.stream()
                .map(WorkspaceMember::getWorkspace)
                .filter(w -> w != null)
                .toList();

        List<Workspace> list = new java.util.ArrayList<>(createdWorkspaces);
        list.addAll(memberWorkspaces);

        return list.stream()
                .distinct()
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
                !request.getSlug().equals(workspace.getSlug())) {
            boolean slugExists = workspace.getOrganization() != null
                    ? workspaceRepository.existsByOrganizationIdAndSlug(
                    workspace.getOrganization().getId(),
                    request.getSlug()
            )
                    : workspaceRepository.existsByCreatedByIdAndSlug(
                    workspace.getCreatedBy().getId(),
                    request.getSlug()
            );

            if (slugExists) {
                throw new BadRequestException(
                        "Workspace slug already exists"
                );
            }
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
