package com.apiaura.apiaura.identity.auth.service;

import com.apiaura.apiaura.identity.auth.dto.request.LoginRequest;
import com.apiaura.apiaura.identity.auth.dto.request.RefreshTokenRequest;
import com.apiaura.apiaura.identity.auth.dto.request.RegisterRequest;
import com.apiaura.apiaura.identity.auth.dto.response.AuthResponse;

import java.util.UUID;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refresh(RefreshTokenRequest request);

    void logout(String refreshToken);

    void logoutAll(UUID userId);
}
