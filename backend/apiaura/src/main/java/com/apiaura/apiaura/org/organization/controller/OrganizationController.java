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

    @GetMapping
    public ApiResponse<List<OrganizationResponse>> getMine() {

        return ApiResponse.success(
                organizationService.getByOwner(
                        SecurityUtils.getCurrentUserId()
                )
        );
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
