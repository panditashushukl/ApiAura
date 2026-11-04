package com.apiaura.apiaura.org.organization.controller;

import com.apiaura.apiaura.foundation.common.response.ApiResponse;
import com.apiaura.apiaura.foundation.common.security.SecurityUtils;
import com.apiaura.apiaura.org.organization.dto.request.CreateOrganizationRequest;
import com.apiaura.apiaura.org.organization.dto.request.UpdateOrganizationRequest;
import com.apiaura.apiaura.org.organization.dto.response.OrganizationResponse;
import com.apiaura.apiaura.org.organization.service.OrganizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/organizations")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationService organizationService;
    private final com.apiaura.apiaura.identity.user.repository.UserRepository userRepository;

    @GetMapping
    public ApiResponse<List<OrganizationResponse>> getAllOrMine(
            @RequestParam(required = false, defaultValue = "false") boolean all
    ) {
        UUID currentUserId = null;
        try {
            currentUserId = SecurityUtils.getCurrentUserId();
        } catch (Exception ignored) {}

        boolean isSuperAdmin = false;
        if (currentUserId != null) {
            try {
                isSuperAdmin = userRepository.findById(currentUserId)
                        .map(u -> u.getRoles().stream()
                                .anyMatch(ur -> ur.getRole() != null && "SUPER_ADMIN".equalsIgnoreCase(ur.getRole().getCode())))
                        .orElse(false);
            } catch (Exception ignored) {}
        }

        if (all || isSuperAdmin || currentUserId == null) {
            return ApiResponse.success(organizationService.getAll());
        }

        return ApiResponse.success(organizationService.getByOwner(currentUserId));
    }

    @GetMapping("/all")
    public ApiResponse<List<OrganizationResponse>> getAll() {
        return ApiResponse.success(organizationService.getAll());
    }

    @GetMapping("/{organizationId}")
    public ApiResponse<OrganizationResponse> getById(
            @PathVariable UUID organizationId
    ) {
        return ApiResponse.success(
                organizationService.getById(organizationId)
        );
    }

    @PostMapping
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
    public ApiResponse<Void> delete(
            @PathVariable UUID organizationId
    ) {

        organizationService.delete(organizationId);

        return ApiResponse.success(
                "Organization deleted"
        );
    }
}
