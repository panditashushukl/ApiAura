package com.apiaura.apiaura.org.organization.service;

import com.apiaura.apiaura.foundation.common.exception.BadRequestException;
import com.apiaura.apiaura.foundation.common.exception.ResourceNotFoundException;
import com.apiaura.apiaura.org.organization.dto.request.CreateOrganizationRequest;
import com.apiaura.apiaura.org.organization.dto.request.UpdateOrganizationRequest;
import com.apiaura.apiaura.org.organization.dto.response.OrganizationResponse;
import com.apiaura.apiaura.org.organization.entity.Organization;
import com.apiaura.apiaura.org.organization.repository.OrganizationRepository;
import com.apiaura.apiaura.identity.user.entity.User;
import com.apiaura.apiaura.identity.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrganizationServiceImpl
        implements OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public OrganizationResponse create(
            UUID ownerId,
            CreateOrganizationRequest request
    ) {

        if (organizationRepository.existsBySlug(
                request.getSlug()
        )) {
            throw new BadRequestException(
                    "Organization slug already exists"
            );
        }

        User owner = userRepository.findById(ownerId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Owner not found"
                        )
                );

        Organization organization = new Organization();

        organization.setName(request.getName());
        organization.setSlug(request.getSlug());
        organization.setOwner(owner);

        return OrganizationResponse.from(
                organizationRepository.save(organization)
        );
    }

    @Override
    public OrganizationResponse getById(
            UUID organizationId
    ) {
        return OrganizationResponse.from(
                findOrganization(organizationId)
        );
    }

    @Override
    public List<OrganizationResponse> getByOwner(
            UUID ownerId
    ) {
        return organizationRepository
                .findByOwnerId(ownerId)
                .stream()
                .map(OrganizationResponse::from)
                .toList();
    }

    @Override
    public List<OrganizationResponse> getAll() {
        return organizationRepository.findAll()
                .stream()
                .map(OrganizationResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public OrganizationResponse update(
            UUID organizationId,
            UpdateOrganizationRequest request
    ) {

        Organization organization =
                findOrganization(organizationId);

        if (request.getSlug() != null &&
                !request.getSlug()
                        .equals(organization.getSlug()) &&
                organizationRepository.existsBySlug(
                        request.getSlug()
                )) {

            throw new BadRequestException(
                    "Organization slug already exists"
            );
        }

        if (request.getName() != null) {
            organization.setName(request.getName());
        }

        if (request.getSlug() != null) {
            organization.setSlug(request.getSlug());
        }

        return OrganizationResponse.from(
                organizationRepository.save(organization)
        );
    }

    @Override
    @Transactional
    public void delete(UUID organizationId) {

        Organization organization =
                findOrganization(organizationId);

        organizationRepository.delete(organization);
    }

    private Organization findOrganization(
            UUID organizationId
    ) {
        return organizationRepository.findById(
                organizationId
        ).orElseThrow(() ->
                new ResourceNotFoundException(
                        "Organization not found: " + organizationId
                )
        );
    }
}
