package com.apiaura.apiaura.identity.role.controller;

import com.apiaura.apiaura.foundation.common.response.ApiResponse;
import com.apiaura.apiaura.identity.permission.dto.response.PermissionResponse;
import com.apiaura.apiaura.identity.role.dto.request.CreateRoleRequest;
import com.apiaura.apiaura.identity.role.dto.request.UpdateRoleRequest;
import com.apiaura.apiaura.identity.role.dto.response.RoleResponse;
import com.apiaura.apiaura.identity.role.service.RbacService;
import com.apiaura.apiaura.identity.role.service.RoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;
    private final RbacService rbacService;

    @GetMapping
    public ApiResponse<List<RoleResponse>> getAll() {
        return ApiResponse.success(roleService.getAll());
    }

    @PostMapping
    public ApiResponse<RoleResponse> create(
            @Valid @RequestBody CreateRoleRequest request
    ) {
        return ApiResponse.success(
                "Role created",
                roleService.create(request)
        );
    }

    @GetMapping("/{roleId}")
    public ApiResponse<RoleResponse> getById(
            @PathVariable UUID roleId
    ) {
        return ApiResponse.success(
                roleService.getById(roleId)
        );
    }

    @PatchMapping("/{roleId}")
    public ApiResponse<RoleResponse> update(
            @PathVariable UUID roleId,
            @Valid @RequestBody UpdateRoleRequest request
    ) {
        return ApiResponse.success(
                "Role updated",
                roleService.update(roleId, request)
        );
    }

    @DeleteMapping("/{roleId}")
    public ApiResponse<Void> delete(
            @PathVariable UUID roleId
    ) {
        roleService.delete(roleId);

        return ApiResponse.success("Role deleted");
    }

    @GetMapping("/{roleId}/permissions")
    public ApiResponse<List<PermissionResponse>>
    getPermissions(
            @PathVariable UUID roleId
    ) {
        return ApiResponse.success(
                rbacService.getRolePermissions(roleId)
        );
    }

    @PutMapping("/{roleId}/permissions/{permissionId}")
    public ApiResponse<Void> grantPermission(
            @PathVariable UUID roleId,
            @PathVariable UUID permissionId
    ) {

        rbacService.grantPermission(
                roleId,
                permissionId
        );

        return ApiResponse.success(
                "Permission granted"
        );
    }

    @DeleteMapping("/{roleId}/permissions/{permissionId}")
    public ApiResponse<Void> revokePermission(
            @PathVariable UUID roleId,
            @PathVariable UUID permissionId
    ) {

        rbacService.revokePermission(
                roleId,
                permissionId
        );

        return ApiResponse.success(
                "Permission revoked"
        );
    }
}
