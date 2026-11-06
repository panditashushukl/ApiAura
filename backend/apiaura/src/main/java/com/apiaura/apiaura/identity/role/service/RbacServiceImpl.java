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
import com.apiaura.apiaura.foundation.common.security.SecurityUtils;
import org.springframework.security.access.AccessDeniedException;
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

        boolean isSuperAdmin = SecurityUtils.isSuperAdmin();

        if ("SUPER_ADMIN".equalsIgnoreCase(role.getCode()) && !isSuperAdmin) {
            throw new AccessDeniedException("Only a Super Administrator can assign the SUPER_ADMIN role");
        }

        if (!isSuperAdmin) {
            try {
                UUID currentUserId = SecurityUtils.getCurrentUserId();
                User currentUser = findUser(currentUserId);
                boolean isSameOrg = currentUser.getOrganization() != null &&
                        user.getOrganization() != null &&
                        currentUser.getOrganization().getId().equals(user.getOrganization().getId());
                boolean isOwner = user.getOrganization() != null &&
                        user.getOrganization().getOwner() != null &&
                        user.getOrganization().getOwner().getId().equals(currentUserId);
                if (!isSameOrg && !isOwner) {
                    throw new AccessDeniedException("Org admins can only manage roles for users in their own organization");
                }
            } catch (AccessDeniedException e) {
                throw e;
            } catch (Exception ignored) {}
        }

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

        User user = findUser(userId);
        Role role = findRole(roleId);

        boolean isSuperAdmin = SecurityUtils.isSuperAdmin();

        if ("SUPER_ADMIN".equalsIgnoreCase(role.getCode()) && !isSuperAdmin) {
            throw new AccessDeniedException("Only a Super Administrator can remove the SUPER_ADMIN role");
        }

        if (!isSuperAdmin) {
            try {
                UUID currentUserId = SecurityUtils.getCurrentUserId();
                User currentUser = findUser(currentUserId);
                boolean isSameOrg = currentUser.getOrganization() != null &&
                        user.getOrganization() != null &&
                        currentUser.getOrganization().getId().equals(user.getOrganization().getId());
                boolean isOwner = user.getOrganization() != null &&
                        user.getOrganization().getOwner() != null &&
                        user.getOrganization().getOwner().getId().equals(currentUserId);
                if (!isSameOrg && !isOwner) {
                    throw new AccessDeniedException("Org admins can only manage roles for users in their own organization");
                }
            } catch (AccessDeniedException e) {
                throw e;
            } catch (Exception ignored) {}
        }

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
    @Transactional
    public void setUserRoles(
            UUID userId,
            List<UUID> roleIds
    ) {
        User user = findUser(userId);
        boolean isSuperAdmin = SecurityUtils.isSuperAdmin();

        if (!isSuperAdmin) {
            try {
                UUID currentUserId = SecurityUtils.getCurrentUserId();
                User currentUser = findUser(currentUserId);
                boolean isSameOrg = currentUser.getOrganization() != null &&
                        user.getOrganization() != null &&
                        currentUser.getOrganization().getId().equals(user.getOrganization().getId());
                boolean isOwner = user.getOrganization() != null &&
                        user.getOrganization().getOwner() != null &&
                        user.getOrganization().getOwner().getId().equals(currentUserId);
                if (!isSameOrg && !isOwner) {
                    throw new AccessDeniedException("Org admins can only manage roles for users in their own organization");
                }
            } catch (AccessDeniedException e) {
                throw e;
            } catch (Exception ignored) {}
        }

        List<UserRole> currentRoles = userRoleRepository.findByUserId(userId);

        // Remove roles not in roleIds
        for (UserRole ur : currentRoles) {
            if (roleIds == null || !roleIds.contains(ur.getRole().getId())) {
                if ("SUPER_ADMIN".equalsIgnoreCase(ur.getRole().getCode()) && !isSuperAdmin) {
                    throw new AccessDeniedException("Only Super Administrator can remove SUPER_ADMIN role");
                }
                userRoleRepository.delete(ur);
            }
        }

        // Add new roles
        if (roleIds != null) {
            for (UUID rId : roleIds) {
                if (currentRoles.stream().noneMatch(ur -> ur.getRole().getId().equals(rId))) {
                    Role role = findRole(rId);
                    if ("SUPER_ADMIN".equalsIgnoreCase(role.getCode()) && !isSuperAdmin) {
                        throw new AccessDeniedException("Only a Super Administrator can assign the SUPER_ADMIN role");
                    }
                    UserRole userRole = new UserRole();
                    userRole.setUser(user);
                    userRole.setRole(role);
                    userRole.setAssignedAt(Instant.now());
                    userRoleRepository.save(userRole);
                }
            }
        }
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
