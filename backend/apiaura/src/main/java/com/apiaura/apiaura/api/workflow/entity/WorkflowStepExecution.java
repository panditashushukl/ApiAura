package com.apiaura.apiaura.api.workflow.entity;

import com.apiaura.apiaura.foundation.common.entity.BaseEntity;
import com.apiaura.apiaura.engine.execution.entity.RequestExecution;
import com.apiaura.apiaura.api.workflow.enums.WorkflowExecutionStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(
        name = "workflow_step_executions",
        indexes = {
                @Index(
                        name = "idx_workflow_step_execution_workflow",
                        columnList = "workflow_execution_id"
                ),
                @Index(
                        name = "idx_workflow_step_execution_request",
                        columnList = "request_execution_id"
                )
        }
)
public class WorkflowStepExecution extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "workflow_execution_id",
            nullable = false
    )
    private WorkflowExecution workflowExecution;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "workflow_step_id",
            nullable = false
    )
    private WorkflowStep workflowStep;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_execution_id")
    private RequestExecution requestExecution;

    @Column(nullable = false)
    private int sortOrder;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private WorkflowExecutionStatus status;

    @Column(columnDefinition = "TEXT")
    private String extractedValue;

    @Column(length = 150)
    private String extractedVariable;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    @Column(nullable = false)
    private long durationMs;
}
