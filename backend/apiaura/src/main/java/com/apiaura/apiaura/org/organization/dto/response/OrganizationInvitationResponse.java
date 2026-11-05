package com.apiaura.apiaura.org.organization.dto.response;

import com.apiaura.apiaura.foundation.common.enums.InvitationStatus;
import com.apiaura.apiaura.org.organization.entity.OrganizationInvitation;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class OrganizationInvitationResponse {

    private UUID id;
    private UUID organizationId;
    private String organizationName;
    private String organizationSlug;
    private String email;
    private UUID roleId;
    private String roleName;
    private String roleCode;
    private UUID invitedById;
    private String inviterName;
    private InvitationStatus status;
    private Instant invitedAt;
    private Instant expiresAt;
    private Instant respondedAt;
    private String token;
    private String invitationUrl;

    public static OrganizationInvitationResponse from(OrganizationInvitation invitation, String frontendBaseUrl) {
        String inviteUrl = null;
        if (frontendBaseUrl != null && invitation.getToken() != null) {
            String base = frontendBaseUrl.endsWith("/") ? frontendBaseUrl.substring(0, frontendBaseUrl.length() - 1) : frontendBaseUrl;
            inviteUrl = base + "/invite/accept?token=" + invitation.getToken();
        }

        return OrganizationInvitationResponse.builder()
                .id(invitation.getId())
                .organizationId(invitation.getOrganization().getId())
                .organizationName(invitation.getOrganization().getName())
                .organizationSlug(invitation.getOrganization().getSlug())
                .email(invitation.getEmail())
                .roleId(invitation.getRole().getId())
                .roleName(invitation.getRole().getName())
                .roleCode(invitation.getRole().getCode())
                .invitedById(invitation.getInvitedBy().getId())
                .inviterName(invitation.getInvitedBy().getName())
                .status(invitation.getStatus())
                .invitedAt(invitation.getInvitedAt())
                .expiresAt(invitation.getExpiresAt())
                .respondedAt(invitation.getRespondedAt())
                .token(invitation.getToken())
                .invitationUrl(inviteUrl)
                .build();
    }
}

