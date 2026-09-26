package com.apiaura.apiaura.api.workflow.entity;

import com.apiaura.apiaura.foundation.common.entity.BaseEntity;
import com.apiaura.apiaura.api.request.entity.ApiRequest;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(
        name = "workflow_steps",
        indexes = {
                @Index(
                        name = "idx_workflow_step_workflow",
                        columnList = "workflow_id"
                ),
                @Index(
                        name = "idx_workflow_step_request",
                        columnList = "request_id"
                )
        }
)
public class WorkflowStep extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "workflow_id",
            nullable = false
    )
    private Workflow workflow;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "request_id",
            nullable = false
    )
    private ApiRequest request;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false)
    private int sortOrder;

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(nullable = false)
    private boolean continueOnFailure = false;

    /*
     * Optional JSON path used to extract a response value.
     *
     * Example:
     *
     * $.data.id
     */
    @Column(length = 500)
    private String extractPath;

    /*
     * Variable name into which extractPath is stored.
     *
     * Example:
     *
     * userId
     */
    @Column(length = 150)
    private String extractVariable;
}