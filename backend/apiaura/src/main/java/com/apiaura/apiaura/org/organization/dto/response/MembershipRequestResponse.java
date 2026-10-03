package com.apiaura.apiaura.org.organization.dto.response;

import com.apiaura.apiaura.foundation.common.enums.MembershipRequestStatus;
import com.apiaura.apiaura.org.organization.entity.OrganizationMembershipRequest;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class MembershipRequestResponse {

    private UUID id;
    private UUID userId;
    private String userName;
    private String userEmail;
    private UUID organizationId;
    private String organizationName;
    private MembershipRequestStatus status;
    private String message;
    private Instant requestedAt;
    private Instant reviewedAt;
    private String reviewedByName;

    public static MembershipRequestResponse from(OrganizationMembershipRequest request) {
        String reviewedBy = null;
        try {
            if (request.getReviewedBy() != null) {
                reviewedBy = request.getReviewedBy().getName();
            }
        } catch (Exception ignored) {}

        return MembershipRequestResponse.builder()
                .id(request.getId())
                .userId(request.getUser().getId())
                .userName(request.getUser().getName())
                .userEmail(request.getUser().getEmail())
                .organizationId(request.getOrganization().getId())
                .organizationName(request.getOrganization().getName())
                .status(request.getStatus())
                .message(request.getMessage())
                .requestedAt(request.getRequestedAt())
                .reviewedAt(request.getReviewedAt())
                .reviewedByName(reviewedBy)
                .build();
    }
}
