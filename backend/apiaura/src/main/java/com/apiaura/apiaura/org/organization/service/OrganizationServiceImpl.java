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

import com.apiaura.apiaura.org.organization.entity.OrganizationMembershipRequest;
import com.apiaura.apiaura.org.organization.repository.OrganizationMembershipRequestRepository;
import com.apiaura.apiaura.identity.role.entity.Role;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrganizationServiceImpl
        implements OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final com.apiaura.apiaura.identity.role.repository.RoleRepository roleRepository;
    private final com.apiaura.apiaura.identity.role.repository.UserRoleRepository userRoleRepository;
    private final OrganizationMembershipRequestRepository membershipRequestRepository;

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

        organization = organizationRepository.save(organization);

        // Update owner's organization association
        owner.setOrganization(organization);

        // Assign ADMIN role if not already assigned
        final Organization savedOrg = organization;
        roleRepository.findByCode("ADMIN").ifPresent(adminRole -> {
            if (!userRoleRepository.existsByUserIdAndRoleId(owner.getId(), adminRole.getId())) {
                com.apiaura.apiaura.identity.role.entity.UserRole ur = new com.apiaura.apiaura.identity.role.entity.UserRole();
                ur.setUser(owner);
                ur.setRole(adminRole);
                ur.setAssignedAt(java.time.Instant.now());
                userRoleRepository.save(ur);
                owner.getRoles().add(ur);
            }
        });

        userRepository.save(owner);

        return OrganizationResponse.from(savedOrg);
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

        if (request.getOwnerId() != null) {
            User newOwner = userRepository.findById(request.getOwnerId())
                    .orElseThrow(() -> new ResourceNotFoundException("New owner not found: " + request.getOwnerId()));
            organization.setOwner(newOwner);
            newOwner.setOrganization(organization);
            userRepository.save(newOwner);
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

        // 1. Unlink users associated with this organization
        List<User> users = userRepository.findByOrganizationId(organizationId);
        for (User user : users) {
            user.setOrganization(null);
        }
        if (!users.isEmpty()) {
            userRepository.saveAll(users);
        }

        // 2. Delete membership requests associated with this organization
        List<OrganizationMembershipRequest> membershipRequests = membershipRequestRepository.findByOrganizationId(organizationId);
        if (!membershipRequests.isEmpty()) {
            membershipRequestRepository.deleteAll(membershipRequests);
        }

        // 3. Unlink organization-scoped custom roles
        List<Role> roles = roleRepository.findByOrganizationId(organizationId);
        for (Role role : roles) {
            role.setOrganization(null);
        }
        if (!roles.isEmpty()) {
            roleRepository.saveAll(roles);
        }

        // 4. Delete organization (Cascades to workspaces, collections, requests, test suites, etc.)
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
