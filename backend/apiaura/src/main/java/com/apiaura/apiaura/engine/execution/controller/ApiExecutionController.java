package com.apiaura.apiaura.engine.execution.controller;

import com.apiaura.apiaura.foundation.common.response.ApiResponse;
import com.apiaura.apiaura.engine.execution.dto.request.ExecuteApiRequest;
import com.apiaura.apiaura.engine.execution.dto.response.ApiExecutionResponse;
import com.apiaura.apiaura.engine.execution.service.ApiExecutionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/requests")
public class ApiExecutionController {

    private final ApiExecutionService apiExecutionService;

    public ApiExecutionController(
            ApiExecutionService apiExecutionService
    ) {
        this.apiExecutionService =
                apiExecutionService;
    }

    @PostMapping("/{requestId}/execute")
    public ResponseEntity<ApiResponse<ApiExecutionResponse>> execute(
            @PathVariable UUID requestId,
            @Valid @RequestBody ExecuteApiRequest request
    ) {

        ApiExecutionResponse response =
                apiExecutionService.execute(
                        requestId,
                        request
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "API request executed successfully",
                        response
                )
        );
    }
}
