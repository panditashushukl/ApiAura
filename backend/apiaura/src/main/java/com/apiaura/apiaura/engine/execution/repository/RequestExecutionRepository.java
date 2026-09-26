package com.apiaura.apiaura.engine.execution.repository;

import com.apiaura.apiaura.engine.execution.entity.RequestExecution;
import com.apiaura.apiaura.execution.enums.ExecutionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface RequestExecutionRepository
        extends JpaRepository<RequestExecution, UUID> {

    Page<RequestExecution> findByRequestIdOrderByCreatedAtDesc(
            UUID requestId,
            Pageable pageable
    );

    Page<RequestExecution> findByExecutedByIdOrderByCreatedAtDesc(
            UUID userId,
            Pageable pageable
    );

    Page<RequestExecution> findByRequestIdAndExecutedByIdOrderByCreatedAtDesc(
            UUID requestId,
            UUID userId,
            Pageable pageable
    );

    long countByRequestId(UUID requestId);

    long countByStatus(ExecutionStatus status);
}
