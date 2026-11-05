package com.apiaura.apiaura.org.organization.security;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvitationTokenPayload {
    private UUID invitationId;
    private UUID organizationId;
    private String email;
    private UUID roleId;
    private String roleCode;
    private long expiresAtEpochMs;
}

