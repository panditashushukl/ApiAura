package com.apiaura.apiaura.api.workflow.entity;

import com.apiaura.apiaura.foundation.common.entity.BaseEntity;
import com.apiaura.apiaura.api.environment.entity.Environment;
import com.apiaura.apiaura.identity.user.entity.User;
import com.apiaura.apiaura.api.workflow.enums.WorkflowExecutionStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(
        name = "workflow_executions",
        indexes = {
                @Index(
                        name = "idx_workflow_execution_workflow",
                        columnList = "workflow_id"
                ),
                @Index(
                        name = "idx_workflow_execution_user",
                        columnList = "executed_by"
                ),
                @Index(
                        name = "idx_workflow_execution_created",
                        columnList = "created_at"
                )
        }
)
public class WorkflowExecution extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "workflow_id",
            nullable = false
    )
    private Workflow workflow;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "environment_id")
    private Environment environment;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "executed_by",
            nullable = false
    )
    private User executedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private WorkflowExecutionStatus status;

    @Column(nullable = false)
    private int totalSteps;

    @Column(nullable = false)
    private int completedSteps;

    @Column(nullable = false)
    private int failedSteps;

    @Column(nullable = false)
    private long durationMs;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    @OneToMany(
            mappedBy = "workflowExecution",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @OrderBy("sortOrder ASC")
    private List<WorkflowStepExecution> stepExecutions =
            new ArrayList<>();
}
