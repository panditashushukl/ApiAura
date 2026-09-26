package com.apiaura.apiaura.api.collection.service;

import com.apiaura.apiaura.api.collection.dto.request.CreateCollectionRequest;
import com.apiaura.apiaura.api.collection.dto.request.UpdateCollectionRequest;
import com.apiaura.apiaura.api.collection.dto.response.CollectionResponse;
import com.apiaura.apiaura.api.collection.entity.Collection;
import com.apiaura.apiaura.api.collection.repository.CollectionRepository;
import com.apiaura.apiaura.foundation.common.exception.BadRequestException;
import com.apiaura.apiaura.foundation.common.exception.ForbiddenException;
import com.apiaura.apiaura.foundation.common.exception.ResourceNotFoundException;
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
public class CollectionServiceImpl implements CollectionService {

    private final CollectionRepository collectionRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;

    @Override
    public CollectionResponse create(
            UUID workspaceId,
            UUID userId,
            CreateCollectionRequest request
    ) {
        Workspace workspace = getWorkspace(workspaceId);

        ensureWorkspaceAccess(workspace, userId);

        String name = normalizeRequired(request.name());

        if (collectionRepository.existsByWorkspaceIdAndNameIgnoreCase(
                workspaceId,
                name
        )) {
            throw new BadRequestException(
                    "A collection with this name already exists in the workspace"
            );
        }

        User user = getUser(userId);

        Collection collection = new Collection();
        collection.setWorkspace(workspace);
        collection.setCreatedBy(user);
        collection.setName(name);
        collection.setDescription(normalizeNullable(request.description()));
        collection.setBaseUrl(normalizeNullable(request.baseUrl()));
        collection.setDocumentation(
                normalizeNullable(request.documentation())
        );

        Collection saved = collectionRepository.save(collection);

        return CollectionResponse.from(saved);
    }

    @Override
    @Transactional
    public CollectionResponse getById(
            UUID collectionId,
            UUID userId
    ) {
        Collection collection = collectionRepository
                .findDetailedById(collectionId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Collection not found: " + collectionId
                        )
                );

        ensureWorkspaceAccess(collection.getWorkspace(), userId);

        return CollectionResponse.from(collection);
    }

    @Override
    public Page<CollectionResponse> getByWorkspace(
            UUID workspaceId,
            UUID userId,
            Pageable pageable
    ) {
        Workspace workspace = getWorkspace(workspaceId);

        ensureWorkspaceAccess(workspace, userId);

        return collectionRepository
                .findByWorkspaceId(workspaceId, pageable)
                .map(CollectionResponse::from);
    }

    @Override
    public CollectionResponse update(
            UUID collectionId,
            UUID userId,
            UpdateCollectionRequest request
    ) {
        Collection collection = collectionRepository
                .findDetailedById(collectionId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Collection not found: " + collectionId
                        )
                );

        ensureWorkspaceAccess(collection.getWorkspace(), userId);

        if (request.name() != null) {

            String name = normalizeRequired(request.name());

            if (!name.equalsIgnoreCase(collection.getName())
                    && collectionRepository.existsByWorkspaceIdAndNameIgnoreCase(
                    collection.getWorkspace().getId(),
                    name
            )) {
                throw new BadRequestException(
                        "A collection with this name already exists in the workspace"
                );
            }

            collection.setName(name);
        }

        if (request.description() != null) {
            collection.setDescription(
                    normalizeNullable(request.description())
            );
        }

        if (request.baseUrl() != null) {
            collection.setBaseUrl(
                    normalizeNullable(request.baseUrl())
            );
        }

        if (request.documentation() != null) {
            collection.setDocumentation(
                    normalizeNullable(request.documentation())
            );
        }

        return CollectionResponse.from(
                collectionRepository.save(collection)
        );
    }

    @Override
    public void delete(
            UUID collectionId,
            UUID userId
    ) {
        Collection collection = collectionRepository
                .findDetailedById(collectionId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Collection not found: " + collectionId
                        )
                );

        ensureWorkspaceAccess(collection.getWorkspace(), userId);

        collectionRepository.delete(collection);
    }

    private Workspace getWorkspace(UUID workspaceId) {
        return workspaceRepository.findById(workspaceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Workspace not found: " + workspaceId
                        )
                );
    }

    private User getUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found: " + userId
                        )
                );
    }

    private void ensureWorkspaceAccess(
            Workspace workspace,
            UUID userId
    ) {
        if (workspace.getCreatedBy().getId().equals(userId)) {
            return;
        }

        WorkspaceMember member = workspaceMemberRepository
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
                    "Collection name cannot be blank"
            );
        }

        return value.trim();
    }

    private String normalizeNullable(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }

        return value.trim();
    }
}
