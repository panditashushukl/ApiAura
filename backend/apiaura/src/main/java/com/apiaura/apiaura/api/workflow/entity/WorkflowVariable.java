package com.apiaura.apiaura.api.workflow.entity;

import com.apiaura.apiaura.foundation.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(
        name = "workflow_variables",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_workflow_variable",
                        columnNames = {
                                "workflow_id",
                                "variable_key"
                        }
                )
        },
        indexes = {
                @Index(
                        name = "idx_workflow_variable_workflow",
                        columnList = "workflow_id"
                )
        }
)
public class WorkflowVariable extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "workflow_id",
            nullable = false
    )
    private Workflow workflow;

    @Column(
            name = "variable_key",
            nullable = false,
            length = 150
    )
    private String variableKey;

    @Column(columnDefinition = "TEXT")
    private String variableValue;

    @Column(nullable = false)
    private boolean secret = false;

    @Column(nullable = false)
    private boolean enabled = true;
}