package com.apiaura.apiaura.api.request.controller;

import com.apiaura.apiaura.foundation.common.response.ApiResponse;
import com.apiaura.apiaura.foundation.common.security.SecurityUtils;
import com.apiaura.apiaura.api.request.dto.request.CreateQueryParameterRequest;
import com.apiaura.apiaura.api.request.dto.request.UpdateQueryParameterRequest;
import com.apiaura.apiaura.api.request.dto.response.QueryParameterResponse;
import com.apiaura.apiaura.api.request.service.QueryParameterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/requests/{requestId}/query-parameters")
@RequiredArgsConstructor
public class QueryParameterController {

    private final QueryParameterService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<QueryParameterResponse>>> getAll(
            @PathVariable UUID requestId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Query parameters retrieved successfully",
                        service.getByRequest(
                                requestId,
                                SecurityUtils.getCurrentUserId()
                        )
                )
        );
    }

    @GetMapping("/{parameterId}")
    public ResponseEntity<ApiResponse<QueryParameterResponse>> getById(
            @PathVariable UUID requestId,
            @PathVariable UUID parameterId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Query parameter retrieved successfully",
                        service.getById(
                                requestId,
                                parameterId,
                                SecurityUtils.getCurrentUserId()
                        )
                )
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponse<QueryParameterResponse>> create(
            @PathVariable UUID requestId,
            @Valid @RequestBody CreateQueryParameterRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Query parameter created successfully",
                                service.create(
                                        requestId,
                                        SecurityUtils.getCurrentUserId(),
                                        request
                                )
                        )
                );
    }

    @PatchMapping("/{parameterId}")
    public ResponseEntity<ApiResponse<QueryParameterResponse>> update(
            @PathVariable UUID requestId,
            @PathVariable UUID parameterId,
            @Valid @RequestBody UpdateQueryParameterRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Query parameter updated successfully",
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
                        "Query parameter deleted successfully",
                        null
                )
        );
    }
}
