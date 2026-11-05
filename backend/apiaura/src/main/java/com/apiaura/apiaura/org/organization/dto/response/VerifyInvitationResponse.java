package com.apiaura.apiaura.org.organization.dto.response;

import com.apiaura.apiaura.foundation.common.enums.InvitationStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class VerifyInvitationResponse {

    private boolean valid;
    private String message;
    private UUID organizationId;
    private String organizationName;
    private String organizationSlug;
    private String email;
    private UUID roleId;
    private String roleName;
    private String roleCode;
    private String inviterName;
    private InvitationStatus status;
    private Instant expiresAt;
    private boolean userExists;
}

