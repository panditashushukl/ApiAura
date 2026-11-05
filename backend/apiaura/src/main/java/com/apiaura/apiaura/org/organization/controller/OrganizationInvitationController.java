package com.apiaura.apiaura.org.organization.controller;

import com.apiaura.apiaura.foundation.common.enums.InvitationStatus;
import com.apiaura.apiaura.foundation.common.response.ApiResponse;
import com.apiaura.apiaura.foundation.common.security.SecurityUtils;
import com.apiaura.apiaura.identity.auth.dto.response.AuthResponse;
import com.apiaura.apiaura.org.organization.dto.request.AcceptAndRegisterRequest;
import com.apiaura.apiaura.org.organization.dto.request.AcceptInvitationRequest;
import com.apiaura.apiaura.org.organization.dto.request.CreateInvitationRequest;
import com.apiaura.apiaura.org.organization.dto.response.OrganizationInvitationResponse;
import com.apiaura.apiaura.org.organization.dto.response.VerifyInvitationResponse;
import com.apiaura.apiaura.org.organization.service.OrganizationInvitationService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/organizations")
@RequiredArgsConstructor
public class OrganizationInvitationController {

    private final OrganizationInvitationService invitationService;

    // --- Admin Endpoints ---

    @PostMapping("/{organizationId}/invitations")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<OrganizationInvitationResponse> createInvitation(
            @PathVariable UUID organizationId,
            @Valid @RequestBody CreateInvitationRequest request
    ) {
        OrganizationInvitationResponse response = invitationService.createInvitation(
                SecurityUtils.getCurrentUserId(), organizationId, request
        );
        return ApiResponse.success("Invitation sent successfully", response);
    }

    @GetMapping("/{organizationId}/invitations")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<List<OrganizationInvitationResponse>> getOrganizationInvitations(
            @PathVariable UUID organizationId,
            @RequestParam(required = false) InvitationStatus status
    ) {
        List<OrganizationInvitationResponse> list = invitationService.getInvitationsByOrganization(
                SecurityUtils.getCurrentUserId(), organizationId, status
        );
        return ApiResponse.success(list);
    }

    @DeleteMapping("/{organizationId}/invitations/{invitationId}")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<OrganizationInvitationResponse> cancelInvitation(
            @PathVariable UUID organizationId,
            @PathVariable UUID invitationId
    ) {
        OrganizationInvitationResponse response = invitationService.cancelInvitation(
                SecurityUtils.getCurrentUserId(), organizationId, invitationId
        );
        return ApiResponse.success("Invitation cancelled successfully", response);
    }

    // --- Recipient / Public Verification & Action Endpoints ---

    @GetMapping("/invitations/verify")
    public ApiResponse<VerifyInvitationResponse> verifyInvitation(
            @RequestParam String token
    ) {
        VerifyInvitationResponse response = invitationService.verifyInvitation(token);
        return ApiResponse.success(response);
    }

    @PostMapping("/invitations/accept")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<OrganizationInvitationResponse> acceptInvitation(
            @Valid @RequestBody AcceptInvitationRequest request
    ) {
        OrganizationInvitationResponse response = invitationService.acceptInvitation(
                SecurityUtils.getCurrentUserId(), request
        );
        return ApiResponse.success("Invitation accepted successfully. Welcome to the organization!", response);
    }

    @PostMapping("/invitations/reject")
    public ApiResponse<OrganizationInvitationResponse> rejectInvitation(
            @Valid @RequestBody AcceptInvitationRequest request
    ) {
        UUID currentUserId = null;
        try {
            currentUserId = SecurityUtils.getCurrentUserId();
        } catch (Exception ignored) {
            // Can be called without auth if user rejects directly from token
        }
        OrganizationInvitationResponse response = invitationService.rejectInvitation(currentUserId, request);
        return ApiResponse.success("Invitation declined", response);
    }

    @PostMapping("/invitations/accept-and-register")
    public ApiResponse<AuthResponse> acceptAndRegister(
            @Valid @RequestBody AcceptAndRegisterRequest request,
            HttpServletResponse servletResponse
    ) {
        AuthResponse authResponse = invitationService.acceptAndRegister(request);
        setAuthCookies(servletResponse, authResponse);
        return ApiResponse.success("Account created and organization joined successfully", authResponse);
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
}

