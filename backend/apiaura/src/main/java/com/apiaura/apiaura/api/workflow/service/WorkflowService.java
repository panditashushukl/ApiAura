package com.apiaura.apiaura.api.workflow.service;

import com.apiaura.apiaura.api.workflow.dto.request.ExecuteWorkflowRequest;
import com.apiaura.apiaura.api.workflow.dto.response.WorkflowExecutionResponse;

import java.util.UUID;

public interface WorkflowService {

    WorkflowExecutionResponse execute(
            UUID workflowId,
            ExecuteWorkflowRequest request
    );
}
