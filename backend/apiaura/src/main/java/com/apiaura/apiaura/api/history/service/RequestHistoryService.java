package com.apiaura.apiaura.api.history.service;

import com.apiaura.apiaura.foundation.common.response.PageResponse;
import com.apiaura.apiaura.foundation.common.enums.ExecutionStatus;
import com.apiaura.apiaura.api.history.dto.response.RequestHistoryDetailResponse;
import com.apiaura.apiaura.api.history.dto.response.RequestHistoryResponse;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface RequestHistoryService {

    PageResponse<RequestHistoryResponse> getMyHistory(
            Pageable pageable
    );

    PageResponse<RequestHistoryResponse> getRequestHistory(
            UUID requestId,
            Pageable pageable
    );

    PageResponse<RequestHistoryResponse> getHistoryByStatus(
            ExecutionStatus status,
            Pageable pageable
    );

    RequestHistoryDetailResponse getExecution(
            UUID executionId
    );

    void deleteExecution(
            UUID executionId
    );
}
