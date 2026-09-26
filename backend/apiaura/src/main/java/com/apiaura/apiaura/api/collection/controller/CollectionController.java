package com.apiaura.apiaura.api.collection.controller;

import com.apiaura.apiaura.api.collection.dto.request.CreateCollectionRequest;
import com.apiaura.apiaura.api.collection.dto.request.UpdateCollectionRequest;
import com.apiaura.apiaura.api.collection.dto.response.CollectionResponse;
import com.apiaura.apiaura.api.collection.service.CollectionService;
import com.apiaura.apiaura.foundation.common.response.ApiResponse;
import com.apiaura.apiaura.foundation.common.security.SecurityUtils;
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
public class CollectionController {

    private final CollectionService collectionService;

    @GetMapping("/workspaces/{workspaceId}/collections")
    public ResponseEntity<ApiResponse<Page<CollectionResponse>>> getCollections(
            @PathVariable UUID workspaceId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        Pageable pageable = PageRequest.of(
                page,
                Math.min(size, 100),
                Sort.by(
                        "asc".equalsIgnoreCase(direction)
                                ? Sort.Direction.ASC
                                : Sort.Direction.DESC,
                        sortBy
                )
        );

        Page<CollectionResponse> collections =
                collectionService.getByWorkspace(
                        workspaceId,
                        SecurityUtils.getCurrentUserId(),
                        pageable
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Collections retrieved successfully",
                        collections
                )
        );
    }

    @GetMapping("/collections/{collectionId}")
    public ResponseEntity<ApiResponse<CollectionResponse>> getCollection(
            @PathVariable UUID collectionId
    ) {
        CollectionResponse response =
                collectionService.getById(
                        collectionId,
                        SecurityUtils.getCurrentUserId()
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Collection retrieved successfully",
                        response
                )
        );
    }

    @PostMapping("/workspaces/{workspaceId}/collections")
    public ResponseEntity<ApiResponse<CollectionResponse>> createCollection(
            @PathVariable UUID workspaceId,
            @Valid @RequestBody CreateCollectionRequest request
    ) {
        CollectionResponse response =
                collectionService.create(
                        workspaceId,
                        SecurityUtils.getCurrentUserId(),
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Collection created successfully",
                                response
                        )
                );
    }

    @PatchMapping("/collections/{collectionId}")
    public ResponseEntity<ApiResponse<CollectionResponse>> updateCollection(
            @PathVariable UUID collectionId,
            @Valid @RequestBody UpdateCollectionRequest request
    ) {
        CollectionResponse response =
                collectionService.update(
                        collectionId,
                        SecurityUtils.getCurrentUserId(),
                        request
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Collection updated successfully",
                        response
                )
        );
    }

    @DeleteMapping("/collections/{collectionId}")
    public ResponseEntity<ApiResponse<Void>> deleteCollection(
            @PathVariable UUID collectionId
    ) {
        collectionService.delete(
                collectionId,
                SecurityUtils.getCurrentUserId()
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Collection deleted successfully",
                        null
                )
        );
    }
}
