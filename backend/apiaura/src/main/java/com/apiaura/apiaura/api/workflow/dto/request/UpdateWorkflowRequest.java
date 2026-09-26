package com.apiaura.apiaura.api.workflow.dto.request;

import com.apiaura.apiaura.api.workflow.enums.WorkflowStatus;
import jakarta.validation.constraints.Size;

public record UpdateWorkflowRequest(

        @Size(max = 150)
        String name,

        @Size(max = 2000)
        String description,

        WorkflowStatus status
) {
}
