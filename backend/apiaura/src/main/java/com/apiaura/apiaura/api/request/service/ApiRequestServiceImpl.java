package com.apiaura.apiaura.api.request.service;

import com.apiaura.apiaura.api.collection.entity.Collection;
import com.apiaura.apiaura.api.collection.entity.CollectionFolder;
import com.apiaura.apiaura.api.collection.repository.CollectionFolderRepository;
import com.apiaura.apiaura.api.collection.repository.CollectionRepository;
import com.apiaura.apiaura.foundation.common.exception.BadRequestException;
import com.apiaura.apiaura.foundation.common.exception.ForbiddenException;
import com.apiaura.apiaura.foundation.common.exception.ResourceNotFoundException;
import com.apiaura.apiaura.api.request.dto.request.CreateApiRequest;
import com.apiaura.apiaura.api.request.dto.request.UpdateApiRequest;
import com.apiaura.apiaura.api.request.dto.response.ApiRequestResponse;
import com.apiaura.apiaura.api.request.entity.ApiRequest;
import com.apiaura.apiaura.api.request.repository.ApiRequestRepository;
import com.apiaura.apiaura.identity.user.entity.User;
import com.apiaura.apiaura.identity.user.repository.UserRepository;
import com.apiaura.apiaura.org.workspace.entity.Workspace;
import com.apiaura.apiaura.org.workspace.entity.WorkspaceMember;
import com.apiaura.apiaura.org.workspace.repository.WorkspaceMemberRepository;
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
public class ApiRequestServiceImpl implements ApiRequestService {

    private final ApiRequestRepository apiRequestRepository;
    private final CollectionRepository collectionRepository;
    private final CollectionFolderRepository collectionFolderRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;

    @Override
    public ApiRequestResponse create(
            UUID collectionId,
            UUID userId,
            CreateApiRequest request
    ) {
        Collection collection = getCollection(collectionId);

        ensureWorkspaceAccess(
                collection.getWorkspace(),
                userId
        );

        String name = normalizeRequired(request.name());

        if (apiRequestRepository.existsByCollectionIdAndNameIgnoreCase(
                collectionId,
                name
        )) {
            throw new BadRequestException(
                    "A request with this name already exists in the collection"
            );
        }

        CollectionFolder folder = resolveFolder(
                request.folderId(),
                collection
        );

        ApiRequest parentRequest = resolveParentRequest(
                request.parentRequestId(),
                collection
        );

        validateParentRelationship(parentRequest, null);

        User user = getUser(userId);

        ApiRequest apiRequest = new ApiRequest();

        apiRequest.setCollection(collection);
        apiRequest.setFolder(folder);
        apiRequest.setParentRequest(parentRequest);
        apiRequest.setCreatedBy(user);

        apiRequest.setName(name);
        apiRequest.setMethod(request.method());
        apiRequest.setUrl(normalizeRequired(request.url()));
        apiRequest.setDescription(
                normalizeNullable(request.description())
        );
        apiRequest.setDocumentation(
                normalizeNullable(request.documentation())
        );
        apiRequest.setBodyType(request.bodyType());
        apiRequest.setBody(request.body());
        apiRequest.setEnabled(
                request.enabled() == null || request.enabled()
        );

        return ApiRequestResponse.from(
                apiRequestRepository.save(apiRequest)
        );
    }

    @Override
    @Transactional
    public ApiRequestResponse getById(
            UUID requestId,
            UUID userId
    ) {
        ApiRequest request = getRequest(requestId);

        ensureWorkspaceAccess(
                request.getCollection().getWorkspace(),
                userId
        );

        return ApiRequestResponse.from(request);
    }

    @Override
    public Page<ApiRequestResponse> getByCollection(
            UUID collectionId,
            UUID userId,
            Pageable pageable
    ) {
        Collection collection = getCollection(collectionId);

        ensureWorkspaceAccess(
                collection.getWorkspace(),
                userId
        );

        return apiRequestRepository
                .findByCollectionId(collectionId, pageable)
                .map(ApiRequestResponse::from);
    }

    @Override
    public Page<ApiRequestResponse> getByFolder(
            UUID collectionId,
            UUID folderId,
            UUID userId,
            Pageable pageable
    ) {
        Collection collection = getCollection(collectionId);

        ensureWorkspaceAccess(
                collection.getWorkspace(),
                userId
        );

        CollectionFolder folder = collectionFolderRepository
                .findByIdAndCollectionId(folderId, collectionId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Folder not found"
                        )
                );

        return apiRequestRepository
                .findByCollectionIdAndFolderId(
                        collectionId,
                        folder.getId(),
                        pageable
                )
                .map(ApiRequestResponse::from);
    }

    @Override
    public ApiRequestResponse update(
            UUID requestId,
            UUID userId,
            UpdateApiRequest update
    ) {
        ApiRequest apiRequest = getRequest(requestId);

        ensureWorkspaceAccess(
                apiRequest.getCollection().getWorkspace(),
                userId
        );

        if (update.name() != null) {

            String name = normalizeRequired(update.name());

            if (!name.equalsIgnoreCase(apiRequest.getName())
                    && apiRequestRepository
                    .existsByCollectionIdAndNameIgnoreCase(
                            apiRequest.getCollection().getId(),
                            name
                    )) {
                throw new BadRequestException(
                        "A request with this name already exists in the collection"
                );
            }

            apiRequest.setName(name);
        }

        if (update.method() != null) {
            apiRequest.setMethod(update.method());
        }

        if (update.url() != null) {
            apiRequest.setUrl(
                    normalizeRequired(update.url())
            );
        }

        if (update.description() != null) {
            apiRequest.setDescription(
                    normalizeNullable(update.description())
            );
        }

        if (update.documentation() != null) {
            apiRequest.setDocumentation(
                    normalizeNullable(update.documentation())
            );
        }

        if (update.bodyType() != null) {
            apiRequest.setBodyType(update.bodyType());
        }

        if (update.body() != null) {
            apiRequest.setBody(update.body());
        }

        if (update.enabled() != null) {
            apiRequest.setEnabled(update.enabled());
        }

        if (update.folderId() != null) {
            apiRequest.setFolder(
                    resolveFolder(
                            update.folderId(),
                            apiRequest.getCollection()
                    )
            );
        }

        if (update.parentRequestId() != null) {

            ApiRequest parent = resolveParentRequest(
                    update.parentRequestId(),
                    apiRequest.getCollection()
            );

            validateParentRelationship(
                    parent,
                    apiRequest
            );

            apiRequest.setParentRequest(parent);
        }

        return ApiRequestResponse.from(
                apiRequestRepository.save(apiRequest)
        );
    }

    @Override
    public void delete(
            UUID requestId,
            UUID userId
    ) {
        ApiRequest request = getRequest(requestId);

        ensureWorkspaceAccess(
                request.getCollection().getWorkspace(),
                userId
        );

        if (!request.getChildRequests().isEmpty()) {
            throw new BadRequestException(
                    "Cannot delete a request that has child requests"
            );
        }

        apiRequestRepository.delete(request);
    }

    private Collection getCollection(UUID collectionId) {
        return collectionRepository.findById(collectionId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Collection not found: " + collectionId
                        )
                );
    }

    private ApiRequest getRequest(UUID requestId) {
        return apiRequestRepository
                .findDetailedById(requestId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "API request not found: " + requestId
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

    private CollectionFolder resolveFolder(
            UUID folderId,
            Collection collection
    ) {
        if (folderId == null) {
            return null;
        }

        return collectionFolderRepository
                .findByIdAndCollectionId(
                        folderId,
                        collection.getId()
                )
                .orElseThrow(() ->
                        new BadRequestException(
                                "Folder does not belong to this collection"
                        )
                );
    }

    private ApiRequest resolveParentRequest(
            UUID parentRequestId,
            Collection collection
    ) {
        if (parentRequestId == null) {
            return null;
        }

        ApiRequest parent = apiRequestRepository
                .findById(parentRequestId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Parent request not found"
                        )
                );

        if (!parent.getCollection().getId()
                .equals(collection.getId())) {
            throw new BadRequestException(
                    "Parent request must belong to the same collection"
            );
        }

        return parent;
    }

    private void validateParentRelationship(
            ApiRequest parent,
            ApiRequest current
    ) {
        if (parent == null || current == null) {
            return;
        }

        if (parent.getId().equals(current.getId())) {
            throw new BadRequestException(
                    "A request cannot be its own parent"
            );
        }

        ApiRequest cursor = parent;

        while (cursor != null) {

            if (cursor.getId().equals(current.getId())) {
                throw new BadRequestException(
                        "Circular request dependency detected"
                );
            }

            cursor = cursor.getParentRequest();
        }
    }

    private void ensureWorkspaceAccess(
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
