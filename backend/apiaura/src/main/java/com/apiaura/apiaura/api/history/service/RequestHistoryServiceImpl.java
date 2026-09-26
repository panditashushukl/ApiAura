package com.apiaura.apiaura.api.history.service;

import com.apiaura.apiaura.foundation.common.exception.ForbiddenException;
import com.apiaura.apiaura.foundation.common.exception.ResourceNotFoundException;
import com.apiaura.apiaura.foundation.common.response.PageResponse;
import com.apiaura.apiaura.foundation.common.security.SecurityUtils;
import com.apiaura.apiaura.engine.execution.entity.RequestExecution;
import com.apiaura.apiaura.foundation.common.enums.ExecutionStatus;
import com.apiaura.apiaura.api.history.dto.response.RequestHistoryDetailResponse;
import com.apiaura.apiaura.api.history.dto.response.RequestHistoryResponse;
import com.apiaura.apiaura.api.history.repository.RequestHistoryRepository;
import com.apiaura.apiaura.org.workspace.repository.WorkspaceMemberRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class RequestHistoryServiceImpl
        implements RequestHistoryService {

    private final RequestHistoryRepository historyRepository;

    private final WorkspaceMemberRepository
            workspaceMemberRepository;

    public RequestHistoryServiceImpl(
            RequestHistoryRepository historyRepository,
            WorkspaceMemberRepository workspaceMemberRepository
    ) {
        this.historyRepository =
                historyRepository;

        this.workspaceMemberRepository =
                workspaceMemberRepository;
    }

    @Override
    public PageResponse<RequestHistoryResponse> getMyHistory(
            Pageable pageable
    ) {

        UUID userId =
                SecurityUtils.getCurrentUserId();

        Page<RequestExecution> page =
                historyRepository
                        .findByExecutedByIdOrderByCreatedAtDesc(
                                userId,
                                pageable
                        );

        return toPageResponse(page);
    }

    @Override
    public PageResponse<RequestHistoryResponse> getRequestHistory(
            UUID requestId,
            Pageable pageable
    ) {

        UUID userId =
                SecurityUtils.getCurrentUserId();

        Page<RequestExecution> page =
                historyRepository
                        .findByRequestIdAndExecutedByIdOrderByCreatedAtDesc(
                                requestId,
                                userId,
                                pageable
                        );

        return toPageResponse(page);
    }

    @Override
    public PageResponse<RequestHistoryResponse> getHistoryByStatus(
            ExecutionStatus status,
            Pageable pageable
    ) {

        UUID userId =
                SecurityUtils.getCurrentUserId();

        Page<RequestExecution> page =
                historyRepository
                        .findByExecutedByIdAndStatusOrderByCreatedAtDesc(
                                userId,
                                status,
                                pageable
                        );

        return toPageResponse(page);
    }

    @Override
    public RequestHistoryDetailResponse getExecution(
            UUID executionId
    ) {

        UUID userId =
                SecurityUtils.getCurrentUserId();

        RequestExecution execution =
                historyRepository
                        .findById(executionId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Request execution not found"
                                )
                        );

        validateAccess(
                execution,
                userId
        );

        return RequestHistoryDetailResponse.from(
                execution
        );
    }

    @Override
    @Transactional
    public void deleteExecution(
            UUID executionId
    ) {

        UUID userId =
                SecurityUtils.getCurrentUserId();

        RequestExecution execution =
                historyRepository
                        .findById(executionId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Request execution not found"
                                )
                        );

        validateAccess(
                execution,
                userId
        );

        historyRepository.delete(execution);
    }

    private void validateAccess(
            RequestExecution execution,
            UUID userId
    ) {

        UUID workspaceId =
                execution
                        .getRequest()
                        .getCollection()
                        .getWorkspace()
                        .getId();

        boolean member =
                workspaceMemberRepository
                        .existsByWorkspaceIdAndUserIdAndStatus(
                                workspaceId,
                                userId,
                                "ACTIVE"
                        );

        if (!member) {
            throw new ForbiddenException(
                    "You do not have access to this execution"
            );
        }
    }

    private PageResponse<RequestHistoryResponse>
    toPageResponse(
            Page<RequestExecution> page
    ) {

        return new PageResponse<>(
                page.getContent()
                        .stream()
                        .map(
                                RequestHistoryResponse::from
                        )
                        .toList(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast()
        );
    }
}
