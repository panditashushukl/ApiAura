package com.apiaura.apiaura.org.organization.repository;

import com.apiaura.apiaura.foundation.common.enums.InvitationStatus;
import com.apiaura.apiaura.org.organization.entity.OrganizationInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrganizationInvitationRepository extends JpaRepository<OrganizationInvitation, UUID> {

    Optional<OrganizationInvitation> findByTokenHash(String tokenHash);

    List<OrganizationInvitation> findByOrganizationId(UUID organizationId);

    List<OrganizationInvitation> findByOrganizationIdAndStatus(UUID organizationId, InvitationStatus status);

    List<OrganizationInvitation> findByEmailIgnoreCase(String email);

    Optional<OrganizationInvitation> findByOrganizationIdAndEmailIgnoreCaseAndStatus(
            UUID organizationId,
            String email,
            InvitationStatus status
    );

    boolean existsByOrganizationIdAndEmailIgnoreCaseAndStatus(
            UUID organizationId,
            String email,
            InvitationStatus status
    );
}

