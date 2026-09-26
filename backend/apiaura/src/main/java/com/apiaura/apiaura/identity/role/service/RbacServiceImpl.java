package com.apiaura.apiaura.identity.role.service;

import com.apiaura.apiaura.foundation.common.exception.BadRequestException;
import com.apiaura.apiaura.foundation.common.exception.ResourceNotFoundException;
import com.apiaura.apiaura.identity.permission.dto.response.PermissionResponse;
import com.apiaura.apiaura.identity.permission.entity.Permission;
import com.apiaura.apiaura.identity.permission.entity.RolePermission;
import com.apiaura.apiaura.identity.permission.repository.PermissionRepository;
import com.apiaura.apiaura.identity.permission.repository.RolePermissionRepository;
import com.apiaura.apiaura.identity.role.dto.response.RoleResponse;
import com.apiaura.apiaura.identity.role.entity.Role;
import com.apiaura.apiaura.identity.role.entity.UserRole;
import com.apiaura.apiaura.identity.role.repository.RoleRepository;
import com.apiaura.apiaura.identity.role.repository.UserRoleRepository;
import com.apiaura.apiaura.identity.user.entity.User;
import com.apiaura.apiaura.identity.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RbacServiceImpl implements RbacService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;

    @Override
    @Transactional
    public void assignRole(
            UUID userId,
            UUID roleId
    ) {

        User user = findUser(userId);
        Role role = findRole(roleId);

        if (userRoleRepository.existsByUserIdAndRoleId(
                userId,
                roleId
        )) {
            throw new BadRequestException(
                    "Role is already assigned to user"
            );
        }

        UserRole userRole = new UserRole();

        userRole.setUser(user);
        userRole.setRole(role);
        userRole.setAssignedAt(Instant.now());

        userRoleRepository.save(userRole);
    }

    @Override
    @Transactional
    public void removeRole(
            UUID userId,
            UUID roleId
    ) {

        if (!userRoleRepository.existsByUserIdAndRoleId(
                userId,
                roleId
        )) {
            throw new ResourceNotFoundException(
                    "Role assignment not found"
            );
        }

        userRoleRepository.deleteByUserIdAndRoleId(
                userId,
                roleId
        );
    }

    @Override
    public List<RoleResponse> getUserRoles(
            UUID userId
    ) {

        findUser(userId);

        return userRoleRepository.findByUserId(userId)
                .stream()
                .map(UserRole::getRole)
                .map(RoleResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public void grantPermission(
            UUID roleId,
            UUID permissionId
    ) {

        Role role = findRole(roleId);

        Permission permission =
                permissionRepository.findById(permissionId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Permission not found"
                                )
                        );

        if (rolePermissionRepository
                .existsByRoleIdAndPermissionId(
                        roleId,
                        permissionId
                )) {

            throw new BadRequestException(
                    "Permission is already assigned"
            );
        }

        RolePermission rolePermission =
                new RolePermission();

        rolePermission.setRole(role);
        rolePermission.setPermission(permission);
        rolePermission.setAssignedAt(Instant.now());

        rolePermissionRepository.save(rolePermission);
    }

    @Override
    @Transactional
    public void revokePermission(
            UUID roleId,
            UUID permissionId
    ) {

        if (!rolePermissionRepository
                .existsByRoleIdAndPermissionId(
                        roleId,
                        permissionId
                )) {

            throw new ResourceNotFoundException(
                    "Permission assignment not found"
            );
        }

        rolePermissionRepository
                .deleteByRoleIdAndPermissionId(
                        roleId,
                        permissionId
                );
    }

    @Override
    public List<PermissionResponse> getRolePermissions(
            UUID roleId
    ) {

        findRole(roleId);

        return rolePermissionRepository
                .findByRoleId(roleId)
                .stream()
                .map(RolePermission::getPermission)
                .map(PermissionResponse::from)
                .toList();
    }

    @Override
    public boolean hasPermission(
            UUID userId,
            String permissionCode
    ) {

        List<UserRole> userRoles =
                userRoleRepository.findByUserId(userId);

        return userRoles.stream()
                .map(UserRole::getRole)
                .flatMap(role ->
                        rolePermissionRepository
                                .findByRoleId(role.getId())
                                .stream()
                )
                .map(RolePermission::getPermission)
                .anyMatch(permission ->
                        permission.getCode()
                                .equals(permissionCode)
                );
    }

    private User findUser(UUID userId) {

        return userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found: " + userId
                        )
                );
    }

    private Role findRole(UUID roleId) {

        return roleRepository.findById(roleId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Role not found: " + roleId
                        )
                );
    }
}
