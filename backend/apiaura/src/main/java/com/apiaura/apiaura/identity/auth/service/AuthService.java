package com.apiaura.apiaura.identity.auth.service;

import com.apiaura.apiaura.identity.auth.dto.request.ForgotPasswordRequest;
import com.apiaura.apiaura.identity.auth.dto.request.LoginRequest;
import com.apiaura.apiaura.identity.auth.dto.request.RefreshTokenRequest;
import com.apiaura.apiaura.identity.auth.dto.request.RegisterRequest;
import com.apiaura.apiaura.identity.auth.dto.request.ResetPasswordRequest;
import com.apiaura.apiaura.identity.auth.dto.response.AuthResponse;
import com.apiaura.apiaura.identity.role.entity.Role;
import com.apiaura.apiaura.identity.user.entity.User;
import com.apiaura.apiaura.org.organization.entity.Organization;

import java.util.UUID;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refresh(RefreshTokenRequest request);

    void logout(String refreshToken);

    void logoutAll(UUID userId);

    AuthResponse issueSession(User user);

    User registerInvitedUser(String name, String email, String rawPassword, String mobileNumber, Organization organization, Role invitedRole);

    void forgotPassword(ForgotPasswordRequest request);

    void resetPassword(ResetPasswordRequest request);
}
