package com.apiaura.apiaura.identity.role.service;

import com.apiaura.apiaura.identity.permission.dto.response.PermissionResponse;
import com.apiaura.apiaura.identity.role.dto.response.RoleResponse;

import java.util.List;
import java.util.UUID;

public interface RbacService {

    void assignRole(
            UUID userId,
            UUID roleId
    );

    void removeRole(
            UUID userId,
            UUID roleId
    );

    List<RoleResponse> getUserRoles(
            UUID userId
    );

    void grantPermission(
            UUID roleId,
            UUID permissionId
    );

    void revokePermission(
            UUID roleId,
            UUID permissionId
    );

    List<PermissionResponse> getRolePermissions(
            UUID roleId
    );

    boolean hasPermission(
            UUID userId,
            String permissionCode
    );
}
