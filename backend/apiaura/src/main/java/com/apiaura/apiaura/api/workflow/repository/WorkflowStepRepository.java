package com.apiaura.apiaura.api.workflow.repository;

import com.apiaura.apiaura.api.workflow.entity.WorkflowStep;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WorkflowStepRepository
        extends JpaRepository<WorkflowStep, UUID> {

    List<WorkflowStep> findByWorkflowIdOrderBySortOrderAsc(
            UUID workflowId
    );

    Optional<WorkflowStep> findByIdAndWorkflowId(
            UUID id,
            UUID workflowId
    );

    boolean existsByWorkflowIdAndSortOrder(
            UUID workflowId,
            int sortOrder
    );
}
