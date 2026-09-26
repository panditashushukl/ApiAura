package com.apiaura.apiaura.identity.user.service;

import com.apiaura.apiaura.foundation.common.enums.UserStatus;
import com.apiaura.apiaura.identity.user.dto.request.UpdateUserRequest;
import com.apiaura.apiaura.identity.user.dto.response.UserResponse;

import java.util.List;
import java.util.UUID;

public interface UserService {

    UserResponse getById(UUID userId);

    UserResponse getByEmail(String email);

    UserResponse update(UUID userId, UpdateUserRequest request);

    void delete(UUID userId);

    UserResponse updateStatus(UUID userId, UserStatus status);

    List<UserResponse> getAll();
}
