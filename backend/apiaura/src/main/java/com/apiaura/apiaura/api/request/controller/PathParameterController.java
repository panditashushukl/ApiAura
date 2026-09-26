package com.apiaura.apiaura.api.request.controller;

import com.apiaura.apiaura.foundation.common.response.ApiResponse;
import com.apiaura.apiaura.foundation.common.security.SecurityUtils;
import com.apiaura.apiaura.api.request.dto.request.CreatePathParameterRequest;
import com.apiaura.apiaura.api.request.dto.request.UpdatePathParameterRequest;
import com.apiaura.apiaura.api.request.dto.response.PathParameterResponse;
import com.apiaura.apiaura.api.request.service.PathParameterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/requests/{requestId}/path-parameters")
@RequiredArgsConstructor
public class PathParameterController {

    private final PathParameterService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PathParameterResponse>>> getAll(
            @PathVariable UUID requestId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Path parameters retrieved successfully",
                        service.getByRequest(
                                requestId,
                                SecurityUtils.getCurrentUserId()
                        )
                )
        );
    }

    @GetMapping("/{parameterId}")
    public ResponseEntity<ApiResponse<PathParameterResponse>> getById(
            @PathVariable UUID requestId,
            @PathVariable UUID parameterId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Path parameter retrieved successfully",
                        service.getById(
                                requestId,
                                parameterId,
                                SecurityUtils.getCurrentUserId()
                        )
                )
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PathParameterResponse>> create(
            @PathVariable UUID requestId,
            @Valid @RequestBody CreatePathParameterRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Path parameter created successfully",
                                service.create(
                                        requestId,
                                        SecurityUtils.getCurrentUserId(),
                                        request
                                )
                        )
                );
    }

    @PatchMapping("/{parameterId}")
    public ResponseEntity<ApiResponse<PathParameterResponse>> update(
            @PathVariable UUID requestId,
            @PathVariable UUID parameterId,
            @Valid @RequestBody UpdatePathParameterRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Path parameter updated successfully",
                        service.update(
                                requestId,
                                parameterId,
                                SecurityUtils.getCurrentUserId(),
                                request
                        )
                )
        );
    }

    @DeleteMapping("/{parameterId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID requestId,
            @PathVariable UUID parameterId
    ) {
        service.delete(
                requestId,
                parameterId,
                SecurityUtils.getCurrentUserId()
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Path parameter deleted successfully",
                        null
                )
        );
    }
}
