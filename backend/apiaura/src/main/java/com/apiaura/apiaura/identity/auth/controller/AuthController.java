package com.apiaura.apiaura.identity.auth.controller;

import com.apiaura.apiaura.foundation.common.exception.UnauthorizedException;
import com.apiaura.apiaura.identity.auth.dto.request.LoginRequest;
import com.apiaura.apiaura.identity.auth.dto.request.RefreshTokenRequest;
import com.apiaura.apiaura.identity.auth.dto.request.RegisterRequest;
import com.apiaura.apiaura.identity.auth.dto.response.AuthResponse;
import com.apiaura.apiaura.identity.auth.service.AuthService;
import com.apiaura.apiaura.foundation.common.response.ApiResponse;
import com.apiaura.apiaura.foundation.common.security.SecurityUtils;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ApiResponse<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletResponse response
    ) {
        AuthResponse authResponse = authService.register(request);
        setAuthCookies(response, authResponse);
        return ApiResponse.success(
                "Registration successful",
                authResponse
        );
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response
    ) {
        AuthResponse authResponse = authService.login(request);
        setAuthCookies(response, authResponse);
        return ApiResponse.success(
                "Login successful",
                authResponse
        );
    }

    @PostMapping("/refresh")
    public ApiResponse<AuthResponse> refresh(
            @RequestBody(required = false) RefreshTokenRequest request,
            HttpServletRequest servletRequest,
            HttpServletResponse response
    ) {
        String tokenToRefresh = null;
        if (request != null && request.getRefreshToken() != null && !request.getRefreshToken().isBlank()) {
            tokenToRefresh = request.getRefreshToken();
        } else if (servletRequest.getCookies() != null) {
            for (Cookie cookie : servletRequest.getCookies()) {
                if ("refreshToken".equalsIgnoreCase(cookie.getName())) {
                    tokenToRefresh = cookie.getValue();
                    break;
                }
            }
        }

        if (tokenToRefresh == null || tokenToRefresh.isBlank()) {
            throw new UnauthorizedException("Refresh token is required");
        }

        RefreshTokenRequest refreshReq = new RefreshTokenRequest();
        refreshReq.setRefreshToken(tokenToRefresh);

        AuthResponse authResponse = authService.refresh(refreshReq);
        setAuthCookies(response, authResponse);
        return ApiResponse.success(
                "Token refreshed",
                authResponse
        );
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(
            @RequestBody(required = false) RefreshTokenRequest request,
            HttpServletRequest servletRequest,
            HttpServletResponse response
    ) {
        String tokenToLogout = null;
        if (request != null && request.getRefreshToken() != null && !request.getRefreshToken().isBlank()) {
            tokenToLogout = request.getRefreshToken();
        } else if (servletRequest.getCookies() != null) {
            for (Cookie cookie : servletRequest.getCookies()) {
                if ("refreshToken".equalsIgnoreCase(cookie.getName())) {
                    tokenToLogout = cookie.getValue();
                    break;
                }
            }
        }

        if (tokenToLogout != null && !tokenToLogout.isBlank()) {
            authService.logout(tokenToLogout);
        }

        clearAuthCookies(response);

        return ApiResponse.success(
                "Logout successful"
        );
    }

    @PostMapping("/logout-all")
    public ApiResponse<Void> logoutAll(
            HttpServletResponse response
    ) {
        authService.logoutAll(
                SecurityUtils.getCurrentUserId()
        );
        clearAuthCookies(response);

        return ApiResponse.success(
                "Logged out from all devices"
        );
    }

    private void setAuthCookies(HttpServletResponse response, AuthResponse authResponse) {
        ResponseCookie accessTokenCookie = ResponseCookie.from("accessToken", authResponse.getAccessToken())
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(7 * 24 * 60 * 60)
                .sameSite("Lax")
                .build();

        ResponseCookie refreshTokenCookie = ResponseCookie.from("refreshToken", authResponse.getRefreshToken())
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(30 * 24 * 60 * 60)
                .sameSite("Lax")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, accessTokenCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString());
    }

    private void clearAuthCookies(HttpServletResponse response) {
        ResponseCookie accessTokenCookie = ResponseCookie.from("accessToken", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();

        ResponseCookie refreshTokenCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, accessTokenCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString());
    }
}

