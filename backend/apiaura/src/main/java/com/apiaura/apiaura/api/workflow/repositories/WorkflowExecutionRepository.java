package com.apiaura.apiaura.api.workflow.repositories;

import com.apiaura.apiaura.api.workflow.entity.WorkflowExecution;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface WorkflowExecutionRepository
        extends JpaRepository<WorkflowExecution, UUID> {

    Page<WorkflowExecution>
    findByWorkflowIdOrderByCreatedAtDesc(
            UUID workflowId,
            Pageable pageable
    );
}
