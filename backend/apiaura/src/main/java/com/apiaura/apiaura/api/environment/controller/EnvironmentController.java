package com.apiaura.apiaura.api.environment.controller;

import com.apiaura.apiaura.foundation.common.response.ApiResponse;
import com.apiaura.apiaura.foundation.common.security.SecurityUtils;
import com.apiaura.apiaura.api.environment.dto.request.CreateEnvironmentRequest;
import com.apiaura.apiaura.api.environment.dto.request.UpdateEnvironmentRequest;
import com.apiaura.apiaura.api.environment.dto.response.EnvironmentResponse;
import com.apiaura.apiaura.api.environment.service.EnvironmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class EnvironmentController {

    private final EnvironmentService environmentService;

    @GetMapping("/workspaces/{workspaceId}/environments")
    public ResponseEntity<ApiResponse<Page<EnvironmentResponse>>> getAll(
            @PathVariable UUID workspaceId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        Pageable pageable = PageRequest.of(
                Math.max(page, 0),
                Math.min(Math.max(size, 1), 100),
                "asc".equalsIgnoreCase(direction)
                        ? Sort.by(Sort.Direction.ASC, sortBy)
                        : Sort.by(Sort.Direction.DESC, sortBy)
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Environments retrieved successfully",
                        environmentService.getByWorkspace(
                                workspaceId,
                                SecurityUtils.getCurrentUserId(),
                                pageable
                        )
                )
        );
    }

    @GetMapping("/environments/{environmentId}")
    public ResponseEntity<ApiResponse<EnvironmentResponse>> getById(
            @PathVariable UUID environmentId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Environment retrieved successfully",
                        environmentService.getById(
                                environmentId,
                                SecurityUtils.getCurrentUserId()
                        )
                )
        );
    }

    @PostMapping("/workspaces/{workspaceId}/environments")
    public ResponseEntity<ApiResponse<EnvironmentResponse>> create(
            @PathVariable UUID workspaceId,
            @Valid @RequestBody CreateEnvironmentRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Environment created successfully",
                                environmentService.create(
                                        workspaceId,
                                        SecurityUtils.getCurrentUserId(),
                                        request
                                )
                        )
                );
    }

    @PatchMapping("/environments/{environmentId}")
    public ResponseEntity<ApiResponse<EnvironmentResponse>> update(
            @PathVariable UUID environmentId,
            @Valid @RequestBody UpdateEnvironmentRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Environment updated successfully",
                        environmentService.update(
                                environmentId,
                                SecurityUtils.getCurrentUserId(),
                                request
                        )
                )
        );
    }

    @PostMapping("/environments/{environmentId}/activate")
    public ResponseEntity<ApiResponse<EnvironmentResponse>> activate(
            @PathVariable UUID environmentId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Environment activated successfully",
                        environmentService.activate(
                                environmentId,
                                SecurityUtils.getCurrentUserId()
                        )
                )
        );
    }

    @PostMapping("/environments/{environmentId}/deactivate")
    public ResponseEntity<ApiResponse<EnvironmentResponse>> deactivate(
            @PathVariable UUID environmentId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Environment deactivated successfully",
                        environmentService.deactivate(
                                environmentId,
                                SecurityUtils.getCurrentUserId()
                        )
                )
        );
    }

    @DeleteMapping("/environments/{environmentId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID environmentId
    ) {
        environmentService.delete(
                environmentId,
                SecurityUtils.getCurrentUserId()
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Environment deleted successfully",
                        null
                )
        );
    }
}
