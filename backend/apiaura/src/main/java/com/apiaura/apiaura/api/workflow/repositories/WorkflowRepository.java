package com.apiaura.apiaura.api.workflow.repositories;

import com.apiaura.apiaura.api.workflow.entity.Workflow;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface WorkflowRepository
        extends JpaRepository<Workflow, UUID> {

    Page<Workflow> findByWorkspaceId(
            UUID workspaceId,
            Pageable pageable
    );

    Optional<Workflow> findByIdAndWorkspaceId(
            UUID id,
            UUID workspaceId
    );

    boolean existsByWorkspaceIdAndNameIgnoreCase(
            UUID workspaceId,
            String name
    );
}
