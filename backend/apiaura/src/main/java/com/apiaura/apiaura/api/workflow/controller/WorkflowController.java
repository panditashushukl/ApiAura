package com.apiaura.apiaura.api.workflow.controller;

import com.apiaura.apiaura.foundation.common.response.ApiResponse;
import com.apiaura.apiaura.api.workflow.dto.request.ExecuteWorkflowRequest;
import com.apiaura.apiaura.api.workflow.dto.response.WorkflowExecutionResponse;
import com.apiaura.apiaura.api.workflow.service.WorkflowService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/workflows")
public class WorkflowController {

    private final WorkflowService workflowService;

    public WorkflowController(
            WorkflowService workflowService
    ) {
        this.workflowService =
                workflowService;
    }

    @PostMapping("/{workflowId}/execute")
    public ResponseEntity<
            ApiResponse<WorkflowExecutionResponse>
            > execute(

            @PathVariable UUID workflowId,

            @Valid
            @RequestBody
            ExecuteWorkflowRequest request

    ) {

        WorkflowExecutionResponse response =
                workflowService.execute(
                        workflowId,
                        request
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Workflow executed successfully",
                        response
                )
        );
    }
}
