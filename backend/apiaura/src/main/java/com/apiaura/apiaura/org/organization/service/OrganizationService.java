package com.apiaura.apiaura.org.organization.service;

import com.apiaura.apiaura.org.organization.dto.request.CreateOrganizationRequest;
import com.apiaura.apiaura.org.organization.dto.request.UpdateOrganizationRequest;
import com.apiaura.apiaura.org.organization.dto.response.OrganizationResponse;

import java.util.List;
import java.util.UUID;

public interface OrganizationService {

    OrganizationResponse create(
            UUID ownerId,
            CreateOrganizationRequest request
    );

    OrganizationResponse getById(UUID organizationId);

    List<OrganizationResponse> getByOwner(UUID ownerId);

    List<OrganizationResponse> getAll();

    OrganizationResponse update(
            UUID organizationId,
            UpdateOrganizationRequest request
    );

    void delete(UUID organizationId);
}
