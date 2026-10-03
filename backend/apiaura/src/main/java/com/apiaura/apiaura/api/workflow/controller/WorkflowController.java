package com.apiaura.apiaura.api.workflow.controller;

import com.apiaura.apiaura.foundation.common.response.ApiResponse;
import com.apiaura.apiaura.api.workflow.dto.request.CreateWorkflowRequest;
import com.apiaura.apiaura.api.workflow.dto.request.ExecuteWorkflowRequest;
import com.apiaura.apiaura.api.workflow.dto.response.WorkflowExecutionResponse;
import com.apiaura.apiaura.api.workflow.dto.response.WorkflowResponse;
import com.apiaura.apiaura.api.workflow.service.WorkflowService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class WorkflowController {

    private final WorkflowService workflowService;

    public WorkflowController(WorkflowService workflowService) {
        this.workflowService = workflowService;
    }

    @GetMapping("/workspaces/{workspaceId}/workflows")
    public ResponseEntity<ApiResponse<List<WorkflowResponse>>> getByWorkspace(
            @PathVariable UUID workspaceId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Workflows retrieved successfully",
                        workflowService.getByWorkspace(workspaceId)
                )
        );
    }

    @PostMapping("/workspaces/{workspaceId}/workflows")
    public ResponseEntity<ApiResponse<WorkflowResponse>> create(
            @PathVariable UUID workspaceId,
            @Valid @RequestBody CreateWorkflowRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Workflow created successfully",
                                workflowService.create(workspaceId, request)
                        )
                );
    }

    @GetMapping("/workflows/{workflowId}")
    public ResponseEntity<ApiResponse<WorkflowResponse>> getById(
            @PathVariable UUID workflowId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        workflowService.getById(workflowId)
                )
        );
    }

    @DeleteMapping("/workflows/{workflowId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID workflowId
    ) {
        workflowService.delete(workflowId);
        return ResponseEntity.ok(
                ApiResponse.success("Workflow deleted successfully", null)
        );
    }

    @PostMapping("/workflows/{workflowId}/execute")
    public ResponseEntity<ApiResponse<WorkflowExecutionResponse>> execute(
            @PathVariable UUID workflowId,
            @Valid @RequestBody ExecuteWorkflowRequest request
    ) {
        WorkflowExecutionResponse response = workflowService.execute(workflowId, request);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Workflow executed successfully",
                        response
                )
        );
    }
}
