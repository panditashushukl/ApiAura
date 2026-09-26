package com.apiaura.apiaura.identity.permission.controller;

import com.apiaura.apiaura.foundation.common.response.ApiResponse;
import com.apiaura.apiaura.identity.permission.dto.request.CreatePermissionRequest;
import com.apiaura.apiaura.identity.permission.dto.response.PermissionResponse;
import com.apiaura.apiaura.identity.permission.service.PermissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/permissions")
@RequiredArgsConstructor
public class PermissionController {

    private final PermissionService permissionService;

    @GetMapping
    public ApiResponse<List<PermissionResponse>> getAll() {
        return ApiResponse.success(
                permissionService.getAll()
        );
    }

    @PostMapping
    public ApiResponse<PermissionResponse> create(
            @Valid @RequestBody CreatePermissionRequest request
    ) {
        return ApiResponse.success(
                "Permission created",
                permissionService.create(request)
        );
    }

    @GetMapping("/{permissionId}")
    public ApiResponse<PermissionResponse> getById(
            @PathVariable UUID permissionId
    ) {
        return ApiResponse.success(
                permissionService.getById(permissionId)
        );
    }

    @GetMapping("/resource/{resource}")
    public ApiResponse<List<PermissionResponse>> byResource(
            @PathVariable String resource
    ) {
        return ApiResponse.success(
                permissionService.getByResource(resource)
        );
    }

    @DeleteMapping("/{permissionId}")
    public ApiResponse<Void> delete(
            @PathVariable UUID permissionId
    ) {

        permissionService.delete(permissionId);

        return ApiResponse.success(
                "Permission deleted"
        );
    }
}
