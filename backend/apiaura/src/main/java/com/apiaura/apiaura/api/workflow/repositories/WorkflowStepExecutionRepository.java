package com.apiaura.apiaura.api.workflow.repositories;

import com.apiaura.apiaura.api.workflow.entity.WorkflowStepExecution;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface WorkflowStepExecutionRepository
        extends JpaRepository<WorkflowStepExecution, UUID> {

    List<WorkflowStepExecution>
    findByWorkflowExecutionIdOrderBySortOrderAsc(
            UUID workflowExecutionId
    );
}
