package com.apiaura.apiaura.api.request.service;

import com.apiaura.apiaura.foundation.common.exception.BadRequestException;
import com.apiaura.apiaura.foundation.common.exception.ForbiddenException;
import com.apiaura.apiaura.foundation.common.exception.ResourceNotFoundException;
import com.apiaura.apiaura.api.request.dto.request.CreateRequestHeaderRequest;
import com.apiaura.apiaura.api.request.dto.request.UpdateRequestHeaderRequest;
import com.apiaura.apiaura.api.request.dto.response.RequestHeaderResponse;
import com.apiaura.apiaura.api.request.entity.ApiRequest;
import com.apiaura.apiaura.api.request.entity.RequestHeader;
import com.apiaura.apiaura.api.request.repository.ApiRequestRepository;
import com.apiaura.apiaura.api.request.repository.RequestHeaderRepository;
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
public class RequestHeaderServiceImpl implements RequestHeaderService {

    private final RequestHeaderRepository headerRepository;
    private final ApiRequestRepository requestRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;

    @Override
    @Transactional
    public List<RequestHeaderResponse> getByRequest(
            UUID requestId,
            UUID userId
    ) {
        ApiRequest request = getRequest(requestId);

        ensureAccess(request.getCollection().getWorkspace(), userId);

        return headerRepository
                .findByRequestIdOrderBySortOrderAsc(requestId)
                .stream()
                .map(RequestHeaderResponse::from)
                .toList();
    }

    @Override
    public RequestHeaderResponse getById(
            UUID requestId,
            UUID headerId,
            UUID userId
    ) {
        ApiRequest request = getRequest(requestId);

        ensureAccess(request.getCollection().getWorkspace(), userId);

        RequestHeader header = headerRepository
                .findByIdAndRequestId(headerId, requestId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Request header not found"
                        )
                );

        return RequestHeaderResponse.from(header);
    }

    @Override
    public RequestHeaderResponse create(
            UUID requestId,
            UUID userId,
            CreateRequestHeaderRequest input
    ) {
        ApiRequest request = getRequest(requestId);

        ensureAccess(request.getCollection().getWorkspace(), userId);

        String key = normalizeRequired(input.headerKey());

        if (headerRepository.existsByRequestIdAndHeaderKeyIgnoreCase(
                requestId,
                key
        )) {
            throw new BadRequestException(
                    "This header already exists"
            );
        }

        RequestHeader header = new RequestHeader();

        header.setRequest(request);
        header.setHeaderKey(key);
        header.setHeaderValue(input.headerValue());
        header.setEnabled(
                input.enabled() == null || input.enabled()
        );
        header.setSecret(
                input.secret() != null && input.secret()
        );
        header.setSortOrder(
                input.sortOrder() == null
                        ? 0
                        : Math.max(input.sortOrder(), 0)
        );

        return RequestHeaderResponse.from(
                headerRepository.save(header)
        );
    }

    @Override
    public RequestHeaderResponse update(
            UUID requestId,
            UUID headerId,
            UUID userId,
            UpdateRequestHeaderRequest input
    ) {
        ApiRequest request = getRequest(requestId);

        ensureAccess(request.getCollection().getWorkspace(), userId);

        RequestHeader header = headerRepository
                .findByIdAndRequestId(headerId, requestId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Request header not found"
                        )
                );

        if (input.headerKey() != null) {
            String key = normalizeRequired(input.headerKey());

            if (!key.equalsIgnoreCase(header.getHeaderKey())
                    && headerRepository
                    .existsByRequestIdAndHeaderKeyIgnoreCase(
                            requestId,
                            key
                    )) {
                throw new BadRequestException(
                        "This header already exists"
                );
            }

            header.setHeaderKey(key);
        }

        if (input.headerValue() != null) {
            header.setHeaderValue(input.headerValue());
        }

        if (input.enabled() != null) {
            header.setEnabled(input.enabled());
        }

        if (input.secret() != null) {
            header.setSecret(input.secret());
        }

        if (input.sortOrder() != null) {
            header.setSortOrder(
                    Math.max(input.sortOrder(), 0)
            );
        }

        return RequestHeaderResponse.from(
                headerRepository.save(header)
        );
    }

    @Override
    public void delete(
            UUID requestId,
            UUID headerId,
            UUID userId
    ) {
        ApiRequest request = getRequest(requestId);

        ensureAccess(request.getCollection().getWorkspace(), userId);

        RequestHeader header = headerRepository
                .findByIdAndRequestId(headerId, requestId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Request header not found"
                        )
                );

        headerRepository.delete(header);
    }

    private ApiRequest getRequest(UUID requestId) {
        return requestRepository
                .findById(requestId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "API request not found"
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
                    "Header key cannot be blank"
            );
        }

        return value.trim();
    }
}
