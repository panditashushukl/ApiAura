package com.apiaura.apiaura.identity.user.controller;

import com.apiaura.apiaura.foundation.common.enums.UserStatus;
import com.apiaura.apiaura.foundation.common.response.ApiResponse;
import com.apiaura.apiaura.identity.user.dto.request.CreateUserRequest;
import com.apiaura.apiaura.identity.user.dto.request.UpdateUserRequest;
import com.apiaura.apiaura.identity.user.dto.response.UserResponse;
import com.apiaura.apiaura.identity.user.service.UserService;
import com.apiaura.apiaura.foundation.common.security.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

import com.apiaura.apiaura.identity.user.dto.request.ChangePasswordRequest;
import com.apiaura.apiaura.identity.user.dto.request.AdminResetPasswordRequest;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final com.apiaura.apiaura.identity.role.service.RbacService rbacService;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<UserResponse> getMe() {
        return ApiResponse.success(
                userService.getById(SecurityUtils.getCurrentUserId())
        );
    }

    @PatchMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<UserResponse> updateMe(
            @Valid @RequestBody UpdateUserRequest request
    ) {
        return ApiResponse.success(
                "Profile updated successfully",
                userService.update(SecurityUtils.getCurrentUserId(), request)
        );
    }

    @PostMapping("/me/change-password")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<Void> changeMyPassword(
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        userService.changePassword(
                SecurityUtils.getCurrentUserId(),
                request.getCurrentPassword(),
                request.getNewPassword()
        );
        return ApiResponse.success("Password changed successfully");
    }

    @PostMapping("/{userId}/reset-password")
    @PreAuthorize("hasAuthority('user:update')")
    public ApiResponse<Void> resetPasswordByAdmin(
            @PathVariable UUID userId,
            @Valid @RequestBody AdminResetPasswordRequest request
    ) {
        userService.resetPasswordByAdmin(
                SecurityUtils.getCurrentUserId(),
                userId,
                request.getNewPassword()
        );
        return ApiResponse.success("User password reset successfully");
    }

    @GetMapping
    @PreAuthorize("hasAuthority('user:read')")
    public ApiResponse<List<UserResponse>> getAll(
            @RequestParam(required = false) UUID organizationId
    ) {
        if (organizationId != null) {
            return ApiResponse.success(userService.getByOrganizationId(organizationId));
        }
        return ApiResponse.success(userService.getAll());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('user:create')")
    public ApiResponse<UserResponse> create(
            @Valid @RequestBody CreateUserRequest request
    ) {
        return ApiResponse.success(
                "User created",
                userService.create(request)
        );
    }

    @GetMapping("/{userId}")
    @PreAuthorize("hasAuthority('user:read') or #userId.toString() == authentication.name")
    public ApiResponse<UserResponse> getById(
            @PathVariable UUID userId
    ) {
        return ApiResponse.success(
                userService.getById(userId)
        );
    }

    @PatchMapping("/{userId}")
    @PreAuthorize("hasAuthority('user:update') or #userId.toString() == authentication.name")
    public ApiResponse<UserResponse> update(
            @PathVariable UUID userId,
            @Valid @RequestBody UpdateUserRequest request
    ) {
        return ApiResponse.success(
                "User updated",
                userService.update(userId, request)
        );
    }

    @PatchMapping("/{userId}/status")
    @PreAuthorize("hasAuthority('user:update')")
    public ApiResponse<UserResponse> updateStatus(
            @PathVariable UUID userId,
            @RequestParam UserStatus status
    ) {
        return ApiResponse.success(
                "User status updated",
                userService.updateStatus(userId, status)
        );
    }

    @DeleteMapping("/{userId}")
    @PreAuthorize("hasAuthority('user:delete')")
    public ApiResponse<Void> delete(
            @PathVariable UUID userId
    ) {
        userService.delete(userId);

        return ApiResponse.success(
                "User deleted"
        );
    }

    @GetMapping("/{userId}/roles")
    @PreAuthorize("hasAuthority('role:read') or hasAuthority('user:read') or #userId.toString() == authentication.name")
    public ApiResponse<List<com.apiaura.apiaura.identity.role.dto.response.RoleResponse>> getUserRoles(
            @PathVariable UUID userId
    ) {
        return ApiResponse.success(rbacService.getUserRoles(userId));
    }

    @PutMapping("/{userId}/roles/{roleId}")
    @PreAuthorize("hasAuthority('role:update')")
    public ApiResponse<Void> assignRole(
            @PathVariable UUID userId,
            @PathVariable UUID roleId
    ) {
        rbacService.assignRole(userId, roleId);
        return ApiResponse.success("Role assigned to user");
    }

    @DeleteMapping("/{userId}/roles/{roleId}")
    @PreAuthorize("hasAuthority('role:update')")
    public ApiResponse<Void> removeRole(
            @PathVariable UUID userId,
            @PathVariable UUID roleId
    ) {
        rbacService.removeRole(userId, roleId);
        return ApiResponse.success("Role removed from user");
    }
}
