package com.apiaura.apiaura.org.organization.repository;

import com.apiaura.apiaura.foundation.common.enums.MembershipRequestStatus;
import com.apiaura.apiaura.org.organization.entity.OrganizationMembershipRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrganizationMembershipRequestRepository extends JpaRepository<OrganizationMembershipRequest, UUID> {

    List<OrganizationMembershipRequest> findByOrganizationId(UUID organizationId);

    List<OrganizationMembershipRequest> findByOrganizationIdAndStatus(UUID organizationId, MembershipRequestStatus status);

    List<OrganizationMembershipRequest> findByUserId(UUID userId);

    boolean existsByUserIdAndOrganizationIdAndStatus(UUID userId, UUID organizationId, MembershipRequestStatus status);
}
