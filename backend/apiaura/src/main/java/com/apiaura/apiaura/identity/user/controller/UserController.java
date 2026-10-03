package com.apiaura.apiaura.identity.user.controller;

import com.apiaura.apiaura.foundation.common.enums.UserStatus;
import com.apiaura.apiaura.foundation.common.response.ApiResponse;
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

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ApiResponse<UserResponse> getMe() {
        return ApiResponse.success(
                userService.getById(SecurityUtils.getCurrentUserId())
        );
    }

    @PatchMapping("/me")
    public ApiResponse<UserResponse> updateMe(
            @Valid @RequestBody UpdateUserRequest request
    ) {
        return ApiResponse.success(
                "Profile updated successfully",
                userService.update(SecurityUtils.getCurrentUserId(), request)
        );
    }

    @PostMapping("/me/change-password")
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
    public ApiResponse<List<UserResponse>> getAll() {
        return ApiResponse.success(userService.getAll());
    }

    @GetMapping("/{userId}")
    public ApiResponse<UserResponse> getById(
            @PathVariable UUID userId
    ) {
        return ApiResponse.success(
                userService.getById(userId)
        );
    }

    @PatchMapping("/{userId}")
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
    public ApiResponse<Void> delete(
            @PathVariable UUID userId
    ) {
        userService.delete(userId);

        return ApiResponse.success(
                "User deleted"
        );
    }
}
