package com.apiaura.apiaura.org.organization.controller;

import com.apiaura.apiaura.foundation.common.response.ApiResponse;
import com.apiaura.apiaura.foundation.common.security.SecurityUtils;
import com.apiaura.apiaura.org.organization.dto.request.CreateJoinRequest;
import com.apiaura.apiaura.org.organization.dto.response.MembershipRequestResponse;
import com.apiaura.apiaura.org.organization.service.OrganizationMembershipService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/organizations")
@RequiredArgsConstructor
public class OrganizationMembershipController {

    private final OrganizationMembershipService membershipService;

    @PostMapping("/{organizationId}/join-requests")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<MembershipRequestResponse> createJoinRequest(
            @PathVariable UUID organizationId,
            @RequestBody(required = false) @Valid CreateJoinRequest request
    ) {
        MembershipRequestResponse response = membershipService.createJoinRequest(
                SecurityUtils.getCurrentUserId(), organizationId, request
        );
        return ApiResponse.success("Membership request submitted", response);
    }

    @GetMapping("/{organizationId}/join-requests")
    @PreAuthorize("hasAuthority('organization:read')")
    public ApiResponse<List<MembershipRequestResponse>> getOrganizationRequests(
            @PathVariable UUID organizationId
    ) {
        List<MembershipRequestResponse> response = membershipService.getRequestsByOrganization(organizationId);
        return ApiResponse.success(response);
    }

    @GetMapping("/join-requests/my")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<List<MembershipRequestResponse>> getMyRequests() {
        List<MembershipRequestResponse> response = membershipService.getRequestsByUser(SecurityUtils.getCurrentUserId());
        return ApiResponse.success(response);
    }

    @PostMapping("/join-requests/{requestId}/approve")
    @PreAuthorize("hasAuthority('organization:update')")
    public ApiResponse<MembershipRequestResponse> approveRequest(
            @PathVariable UUID requestId
    ) {
        MembershipRequestResponse response = membershipService.approveRequest(SecurityUtils.getCurrentUserId(), requestId);
        return ApiResponse.success("Request approved", response);
    }

    @PostMapping("/join-requests/{requestId}/reject")
    @PreAuthorize("hasAuthority('organization:update')")
    public ApiResponse<MembershipRequestResponse> rejectRequest(
            @PathVariable UUID requestId
    ) {
        MembershipRequestResponse response = membershipService.rejectRequest(SecurityUtils.getCurrentUserId(), requestId);
        return ApiResponse.success("Request rejected", response);
    }
}
