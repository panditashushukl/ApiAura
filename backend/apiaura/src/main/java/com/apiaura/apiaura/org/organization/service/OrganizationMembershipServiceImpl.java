package com.apiaura.apiaura.org.organization.service;

import com.apiaura.apiaura.foundation.common.enums.MembershipRequestStatus;
import com.apiaura.apiaura.foundation.common.exception.BadRequestException;
import com.apiaura.apiaura.foundation.common.exception.ResourceNotFoundException;
import com.apiaura.apiaura.identity.user.entity.User;
import com.apiaura.apiaura.identity.user.repository.UserRepository;
import com.apiaura.apiaura.org.organization.dto.request.CreateJoinRequest;
import com.apiaura.apiaura.org.organization.dto.response.MembershipRequestResponse;
import com.apiaura.apiaura.org.organization.entity.Organization;
import com.apiaura.apiaura.org.organization.entity.OrganizationMembershipRequest;
import com.apiaura.apiaura.org.organization.repository.OrganizationMembershipRequestRepository;
import com.apiaura.apiaura.org.organization.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrganizationMembershipServiceImpl implements OrganizationMembershipService {

    private final OrganizationMembershipRequestRepository membershipRequestRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public MembershipRequestResponse createJoinRequest(UUID userId, UUID organizationId, CreateJoinRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        if (membershipRequestRepository.existsByUserIdAndOrganizationIdAndStatus(
                userId, organizationId, MembershipRequestStatus.PENDING)) {
            throw new BadRequestException("You already have a pending join request for this organization");
        }

        OrganizationMembershipRequest req = new OrganizationMembershipRequest();
        req.setUser(user);
        req.setOrganization(org);
        req.setStatus(MembershipRequestStatus.PENDING);
        req.setMessage(request != null ? request.getMessage() : null);
        req.setRequestedAt(Instant.now());

        return MembershipRequestResponse.from(membershipRequestRepository.save(req));
    }

    @Override
    public List<MembershipRequestResponse> getRequestsByOrganization(UUID organizationId) {
        return membershipRequestRepository.findByOrganizationId(organizationId)
                .stream()
                .map(MembershipRequestResponse::from)
                .toList();
    }

    @Override
    public List<MembershipRequestResponse> getRequestsByUser(UUID userId) {
        return membershipRequestRepository.findByUserId(userId)
                .stream()
                .map(MembershipRequestResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public MembershipRequestResponse approveRequest(UUID reviewerId, UUID requestId) {
        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer user not found"));

        OrganizationMembershipRequest req = membershipRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Membership request not found"));

        if (req.getStatus() != MembershipRequestStatus.PENDING) {
            throw new BadRequestException("Request is already processed");
        }

        req.setStatus(MembershipRequestStatus.APPROVED);
        req.setReviewedAt(Instant.now());
        req.setReviewedBy(reviewer);

        User targetUser = req.getUser();
        targetUser.setOrganization(req.getOrganization());
        userRepository.save(targetUser);

        return MembershipRequestResponse.from(membershipRequestRepository.save(req));
    }

    @Override
    @Transactional
    public MembershipRequestResponse rejectRequest(UUID reviewerId, UUID requestId) {
        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer user not found"));

        OrganizationMembershipRequest req = membershipRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Membership request not found"));

        if (req.getStatus() != MembershipRequestStatus.PENDING) {
            throw new BadRequestException("Request is already processed");
        }

        req.setStatus(MembershipRequestStatus.REJECTED);
        req.setReviewedAt(Instant.now());
        req.setReviewedBy(reviewer);

        return MembershipRequestResponse.from(membershipRequestRepository.save(req));
    }
}
