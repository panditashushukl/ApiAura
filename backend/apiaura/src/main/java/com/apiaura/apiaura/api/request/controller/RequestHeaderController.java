package com.apiaura.apiaura.api.request.controller;

import com.apiaura.apiaura.foundation.common.response.ApiResponse;
import com.apiaura.apiaura.foundation.common.security.SecurityUtils;
import com.apiaura.apiaura.api.request.dto.request.CreateRequestHeaderRequest;
import com.apiaura.apiaura.api.request.dto.request.UpdateRequestHeaderRequest;
import com.apiaura.apiaura.api.request.dto.response.RequestHeaderResponse;
import com.apiaura.apiaura.api.request.service.RequestHeaderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/requests/{requestId}/headers")
@RequiredArgsConstructor
public class RequestHeaderController {

    private final RequestHeaderService headerService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RequestHeaderResponse>>> getAll(
            @PathVariable UUID requestId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Request headers retrieved successfully",
                        headerService.getByRequest(
                                requestId,
                                SecurityUtils.getCurrentUserId()
                        )
                )
        );
    }

    @GetMapping("/{headerId}")
    public ResponseEntity<ApiResponse<RequestHeaderResponse>> getById(
            @PathVariable UUID requestId,
            @PathVariable UUID headerId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Request header retrieved successfully",
                        headerService.getById(
                                requestId,
                                headerId,
                                SecurityUtils.getCurrentUserId()
                        )
                )
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RequestHeaderResponse>> create(
            @PathVariable UUID requestId,
            @Valid @RequestBody CreateRequestHeaderRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Request header created successfully",
                                headerService.create(
                                        requestId,
                                        SecurityUtils.getCurrentUserId(),
                                        request
                                )
                        )
                );
    }

    @PatchMapping("/{headerId}")
    public ResponseEntity<ApiResponse<RequestHeaderResponse>> update(
            @PathVariable UUID requestId,
            @PathVariable UUID headerId,
            @Valid @RequestBody UpdateRequestHeaderRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Request header updated successfully",
                        headerService.update(
                                requestId,
                                headerId,
                                SecurityUtils.getCurrentUserId(),
                                request
                        )
                )
        );
    }

    @DeleteMapping("/{headerId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID requestId,
            @PathVariable UUID headerId
    ) {
        headerService.delete(
                requestId,
                headerId,
                SecurityUtils.getCurrentUserId()
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Request header deleted successfully",
                        null
                )
        );
    }
}
