package com.apiaura.apiaura.api.environment.controller;

import com.apiaura.apiaura.foundation.common.response.ApiResponse;
import com.apiaura.apiaura.foundation.common.security.SecurityUtils;
import com.apiaura.apiaura.api.environment.dto.request.CreateEnvironmentVariableRequest;
import com.apiaura.apiaura.api.environment.dto.request.UpdateEnvironmentVariableRequest;
import com.apiaura.apiaura.api.environment.dto.response.EnvironmentVariableResponse;
import com.apiaura.apiaura.api.environment.service.EnvironmentVariableService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/environments/{environmentId}/variables")
@RequiredArgsConstructor
public class EnvironmentVariableController {

    private final EnvironmentVariableService variableService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<EnvironmentVariableResponse>>> getAll(
            @PathVariable UUID environmentId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Environment variables retrieved successfully",
                        variableService.getByEnvironment(
                                environmentId,
                                SecurityUtils.getCurrentUserId()
                        )
                )
        );
    }

    @GetMapping("/{variableId}")
    public ResponseEntity<ApiResponse<EnvironmentVariableResponse>> getById(
            @PathVariable UUID environmentId,
            @PathVariable UUID variableId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Environment variable retrieved successfully",
                        variableService.getById(
                                environmentId,
                                variableId,
                                SecurityUtils.getCurrentUserId()
                        )
                )
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EnvironmentVariableResponse>> create(
            @PathVariable UUID environmentId,
            @Valid @RequestBody CreateEnvironmentVariableRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Environment variable created successfully",
                                variableService.create(
                                        environmentId,
                                        SecurityUtils.getCurrentUserId(),
                                        request
                                )
                        )
                );
    }

    @PatchMapping("/{variableId}")
    public ResponseEntity<ApiResponse<EnvironmentVariableResponse>> update(
            @PathVariable UUID environmentId,
            @PathVariable UUID variableId,
            @Valid @RequestBody UpdateEnvironmentVariableRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Environment variable updated successfully",
                        variableService.update(
                                environmentId,
                                variableId,
                                SecurityUtils.getCurrentUserId(),
                                request
                        )
                )
        );
    }

    @DeleteMapping("/{variableId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID environmentId,
            @PathVariable UUID variableId
    ) {
        variableService.delete(
                environmentId,
                variableId,
                SecurityUtils.getCurrentUserId()
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Environment variable deleted successfully",
                        null
                )
        );
    }
}
