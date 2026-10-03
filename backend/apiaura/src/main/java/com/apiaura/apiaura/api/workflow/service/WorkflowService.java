package com.apiaura.apiaura.api.workflow.service;

import com.apiaura.apiaura.api.workflow.dto.request.CreateWorkflowRequest;
import com.apiaura.apiaura.api.workflow.dto.request.ExecuteWorkflowRequest;
import com.apiaura.apiaura.api.workflow.dto.response.WorkflowExecutionResponse;
import com.apiaura.apiaura.api.workflow.dto.response.WorkflowResponse;

import java.util.List;
import java.util.UUID;

public interface WorkflowService {

    List<WorkflowResponse> getByWorkspace(UUID workspaceId);

    WorkflowResponse create(UUID workspaceId, CreateWorkflowRequest request);

    WorkflowResponse getById(UUID workflowId);

    void delete(UUID workflowId);

    WorkflowExecutionResponse execute(
            UUID workflowId,
            ExecuteWorkflowRequest request
    );
}
