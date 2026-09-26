package com.apiaura.apiaura.api.history.repository;

import com.apiaura.apiaura.engine.execution.entity.RequestExecution;
import com.apiaura.apiaura.foundation.common.enums.ExecutionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface RequestHistoryRepository
        extends JpaRepository<RequestExecution, UUID> {

    Page<RequestExecution> findByExecutedByIdOrderByCreatedAtDesc(
            UUID userId,
            Pageable pageable
    );

    Page<RequestExecution> findByRequestIdAndExecutedByIdOrderByCreatedAtDesc(
            UUID requestId,
            UUID userId,
            Pageable pageable
    );

    Page<RequestExecution> findByRequestIdOrderByCreatedAtDesc(
            UUID requestId,
            Pageable pageable
    );

    Page<RequestExecution> findByExecutedByIdAndStatusOrderByCreatedAtDesc(
            UUID userId,
            ExecutionStatus status,
            Pageable pageable
    );
}
