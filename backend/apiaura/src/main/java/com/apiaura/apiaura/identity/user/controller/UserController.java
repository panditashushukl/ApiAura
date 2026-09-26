package com.apiaura.apiaura.identity.user.controller;

import com.apiaura.apiaura.foundation.common.enums.UserStatus;
import com.apiaura.apiaura.foundation.common.response.ApiResponse;
import com.apiaura.apiaura.identity.user.dto.request.UpdateUserRequest;
import com.apiaura.apiaura.identity.user.dto.response.UserResponse;
import com.apiaura.apiaura.identity.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

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
