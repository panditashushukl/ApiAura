package com.apiaura.apiaura.api.workflow.repositories;

import com.apiaura.apiaura.api.workflow.entity.WorkflowVariable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WorkflowVariableRepository
        extends JpaRepository<WorkflowVariable, UUID> {

    List<WorkflowVariable> findByWorkflowIdOrderByVariableKeyAsc(
            UUID workflowId
    );

    Optional<WorkflowVariable> findByIdAndWorkflowId(
            UUID id,
            UUID workflowId
    );

    boolean existsByWorkflowIdAndVariableKey(
            UUID workflowId,
            String variableKey
    );
}
