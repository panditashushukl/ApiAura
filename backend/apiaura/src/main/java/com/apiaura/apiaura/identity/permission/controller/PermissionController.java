package com.apiaura.apiaura.identity.permission.controller;

import com.apiaura.apiaura.foundation.common.response.ApiResponse;
import com.apiaura.apiaura.identity.permission.dto.response.PermissionResponse;
import com.apiaura.apiaura.identity.permission.service.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/permissions")
@RequiredArgsConstructor
public class PermissionController {

    private final PermissionService permissionService;

    @GetMapping
    @PreAuthorize("hasAuthority('role:read') or hasAuthority('user:read') or hasAuthority('organization:read')")
    public ApiResponse<List<PermissionResponse>> getAll() {
        return ApiResponse.success(
                permissionService.getAll()
        );
    }

    @GetMapping("/{permissionId}")
    @PreAuthorize("hasAuthority('role:read') or hasAuthority('user:read') or hasAuthority('organization:read')")
    public ApiResponse<PermissionResponse> getById(
            @PathVariable UUID permissionId
    ) {
        return ApiResponse.success(
                permissionService.getById(permissionId)
        );
    }

    @GetMapping("/resource/{resource}")
    @PreAuthorize("hasAuthority('role:read') or hasAuthority('user:read') or hasAuthority('organization:read')")
    public ApiResponse<List<PermissionResponse>> byResource(
            @PathVariable String resource
    ) {
        return ApiResponse.success(
                permissionService.getByResource(resource)
        );
    }
}
