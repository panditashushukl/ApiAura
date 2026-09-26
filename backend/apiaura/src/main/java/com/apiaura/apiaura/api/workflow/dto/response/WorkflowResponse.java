package com.apiaura.apiaura.api.workflow.dto.response;

import com.apiaura.apiaura.api.workflow.entity.Workflow;
import com.apiaura.apiaura.api.workflow.enums.WorkflowStatus;

import java.time.Instant;
import java.util.UUID;

public record WorkflowResponse(

        UUID id,
        UUID workspaceId,
        UUID createdBy,
        String name,
        String description,
        WorkflowStatus status,
        Instant createdAt,
        Instant updatedAt

) {

    public static WorkflowResponse from(
            Workflow workflow
    ) {

        return new WorkflowResponse(
                workflow.getId(),
                workflow.getWorkspace().getId(),
                workflow.getCreatedBy().getId(),
                workflow.getName(),
                workflow.getDescription(),
                workflow.getStatus(),
                workflow.getCreatedAt(),
                workflow.getUpdatedAt()
        );
    }
}
