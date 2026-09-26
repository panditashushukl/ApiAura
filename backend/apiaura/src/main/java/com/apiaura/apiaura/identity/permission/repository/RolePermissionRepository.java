package com.apiaura.apiaura.identity.permission.repository;

import com.apiaura.apiaura.identity.permission.entity.RolePermission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RolePermissionRepository
        extends JpaRepository<RolePermission, UUID> {

    List<RolePermission> findByRoleId(UUID roleId);

    List<RolePermission> findByPermissionId(UUID permissionId);

    Optional<RolePermission> findByRoleIdAndPermissionId(
            UUID roleId,
            UUID permissionId
    );

    boolean existsByRoleIdAndPermissionId(
            UUID roleId,
            UUID permissionId
    );

    void deleteByRoleIdAndPermissionId(
            UUID roleId,
            UUID permissionId
    );
}
