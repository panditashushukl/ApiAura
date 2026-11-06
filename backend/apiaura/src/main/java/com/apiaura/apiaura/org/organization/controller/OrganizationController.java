package com.apiaura.apiaura.org.organization.controller;

import com.apiaura.apiaura.foundation.common.response.ApiResponse;
import com.apiaura.apiaura.foundation.common.security.SecurityUtils;
import com.apiaura.apiaura.org.organization.dto.request.CreateOrganizationRequest;
import com.apiaura.apiaura.org.organization.dto.request.UpdateOrganizationRequest;
import com.apiaura.apiaura.org.organization.dto.response.OrganizationResponse;
import com.apiaura.apiaura.org.organization.service.OrganizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/organizations")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationService organizationService;
    private final com.apiaura.apiaura.identity.user.repository.UserRepository userRepository;
    private final com.apiaura.apiaura.identity.user.service.UserService userService;

    @GetMapping
    public ApiResponse<List<OrganizationResponse>> getAllOrMine(
            @RequestParam(required = false, defaultValue = "false") boolean all
    ) {
        UUID currentUserId = null;
        try {
            currentUserId = SecurityUtils.getCurrentUserId();
        } catch (Exception ignored) {}

        boolean isSuperAdmin = SecurityUtils.isSuperAdmin();

        if (all || isSuperAdmin || currentUserId == null) {
            return ApiResponse.success(organizationService.getAll());
        }

        List<OrganizationResponse> owned = organizationService.getByOwner(currentUserId);
        if (!owned.isEmpty()) {
            return ApiResponse.success(owned);
        }

        var userOpt = userRepository.findById(currentUserId);
        if (userOpt.isPresent() && userOpt.get().getOrganization() != null) {
            return ApiResponse.success(List.of(OrganizationResponse.from(userOpt.get().getOrganization())));
        }

        return ApiResponse.success(List.of());
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<List<OrganizationResponse>> getAll() {
        return ApiResponse.success(organizationService.getAll());
    }

    @GetMapping("/{organizationId}")
    @PreAuthorize("hasAuthority('organization:read')")
    public ApiResponse<OrganizationResponse> getById(
            @PathVariable UUID organizationId
    ) {
        return ApiResponse.success(
                organizationService.getById(organizationId)
        );
    }

    @GetMapping("/{organizationId}/users")
    @PreAuthorize("hasAuthority('user:read')")
    public ApiResponse<List<com.apiaura.apiaura.identity.user.dto.response.UserResponse>> getUsersByOrganization(
            @PathVariable UUID organizationId
    ) {
        return ApiResponse.success(
                userService.getByOrganizationId(organizationId)
        );
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<OrganizationResponse> create(
            @Valid @RequestBody CreateOrganizationRequest request
    ) {

        return ApiResponse.success(
                "Organization created",
                organizationService.create(
                        SecurityUtils.getCurrentUserId(),
                        request
                )
        );
    }

    @PatchMapping("/{organizationId}")
    @PreAuthorize("hasAuthority('organization:update')")
    public ApiResponse<OrganizationResponse> update(
            @PathVariable UUID organizationId,
            @Valid @RequestBody UpdateOrganizationRequest request
    ) {

        return ApiResponse.success(
                "Organization updated",
                organizationService.update(
                        organizationId,
                        request
                )
        );
    }

    @DeleteMapping("/{organizationId}")
    @PreAuthorize("hasAuthority('organization:delete')")
    public ApiResponse<Void> delete(
            @PathVariable UUID organizationId
    ) {

        organizationService.delete(organizationId);

        return ApiResponse.success(
                "Organization deleted"
        );
    }
}
