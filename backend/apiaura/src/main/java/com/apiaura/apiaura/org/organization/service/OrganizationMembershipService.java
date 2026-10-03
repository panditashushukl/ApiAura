package com.apiaura.apiaura.org.organization.service;

import com.apiaura.apiaura.org.organization.dto.request.CreateJoinRequest;
import com.apiaura.apiaura.org.organization.dto.response.MembershipRequestResponse;

import java.util.List;
import java.util.UUID;

public interface OrganizationMembershipService {

    MembershipRequestResponse createJoinRequest(UUID userId, UUID organizationId, CreateJoinRequest request);

    List<MembershipRequestResponse> getRequestsByOrganization(UUID organizationId);

    List<MembershipRequestResponse> getRequestsByUser(UUID userId);

    MembershipRequestResponse approveRequest(UUID reviewerId, UUID requestId);

    MembershipRequestResponse rejectRequest(UUID reviewerId, UUID requestId);
}
