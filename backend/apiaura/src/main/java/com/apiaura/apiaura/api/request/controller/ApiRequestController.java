package com.apiaura.apiaura.api.request.controller;

import com.apiaura.apiaura.foundation.common.response.ApiResponse;
import com.apiaura.apiaura.foundation.common.security.SecurityUtils;
import com.apiaura.apiaura.api.request.dto.request.CreateApiRequest;
import com.apiaura.apiaura.api.request.dto.request.UpdateApiRequest;
import com.apiaura.apiaura.api.request.dto.response.ApiRequestResponse;
import com.apiaura.apiaura.api.request.service.ApiRequestService;
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
public class ApiRequestController {

    private final ApiRequestService apiRequestService;

    @GetMapping("/collections/{collectionId}/requests")
    public ResponseEntity<ApiResponse<Page<ApiRequestResponse>>> getRequests(
            @PathVariable UUID collectionId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        Pageable pageable = createPageable(
                page,
                size,
                sortBy,
                direction
        );

        Page<ApiRequestResponse> requests =
                apiRequestService.getByCollection(
                        collectionId,
                        SecurityUtils.getCurrentUserId(),
                        pageable
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "API requests retrieved successfully",
                        requests
                )
        );
    }

    @GetMapping("/collections/{collectionId}/folders/{folderId}/requests")
    public ResponseEntity<ApiResponse<Page<ApiRequestResponse>>> getFolderRequests(
            @PathVariable UUID collectionId,
            @PathVariable UUID folderId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        Pageable pageable = createPageable(
                page,
                size,
                sortBy,
                direction
        );

        Page<ApiRequestResponse> requests =
                apiRequestService.getByFolder(
                        collectionId,
                        folderId,
                        SecurityUtils.getCurrentUserId(),
                        pageable
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Folder requests retrieved successfully",
                        requests
                )
        );
    }

    @GetMapping("/requests/{requestId}")
    public ResponseEntity<ApiResponse<ApiRequestResponse>> getRequest(
            @PathVariable UUID requestId
    ) {
        ApiRequestResponse response =
                apiRequestService.getById(
                        requestId,
                        SecurityUtils.getCurrentUserId()
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "API request retrieved successfully",
                        response
                )
        );
    }

    @PostMapping("/collections/{collectionId}/requests")
    public ResponseEntity<ApiResponse<ApiRequestResponse>> createRequest(
            @PathVariable UUID collectionId,
            @Valid @RequestBody CreateApiRequest request
    ) {
        ApiRequestResponse response =
                apiRequestService.create(
                        collectionId,
                        SecurityUtils.getCurrentUserId(),
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "API request created successfully",
                                response
                        )
                );
    }

    @PatchMapping("/requests/{requestId}")
    public ResponseEntity<ApiResponse<ApiRequestResponse>> updateRequest(
            @PathVariable UUID requestId,
            @Valid @RequestBody UpdateApiRequest request
    ) {
        ApiRequestResponse response =
                apiRequestService.update(
                        requestId,
                        SecurityUtils.getCurrentUserId(),
                        request
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "API request updated successfully",
                        response
                )
        );
    }

    @DeleteMapping("/requests/{requestId}")
    public ResponseEntity<ApiResponse<Void>> deleteRequest(
            @PathVariable UUID requestId
    ) {
        apiRequestService.delete(
                requestId,
                SecurityUtils.getCurrentUserId()
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "API request deleted successfully",
                        null
                )
        );
    }

    private Pageable createPageable(
            int page,
            int size,
            String sortBy,
            String direction
    ) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);

        Sort.Direction sortDirection =
                "asc".equalsIgnoreCase(direction)
                        ? Sort.Direction.ASC
                        : Sort.Direction.DESC;

        return PageRequest.of(
                safePage,
                safeSize,
                Sort.by(sortDirection, sortBy)
        );
    }
}
