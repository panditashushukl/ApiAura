package com.apiaura.apiaura.org.organization.entity;

import com.apiaura.apiaura.foundation.common.entity.BaseEntity;
import com.apiaura.apiaura.foundation.common.enums.InvitationStatus;
import com.apiaura.apiaura.identity.role.entity.Role;
import com.apiaura.apiaura.identity.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(
        name = "organization_invitations",
        indexes = {
                @Index(name = "idx_org_invitations_token_hash", columnList = "token_hash"),
                @Index(name = "idx_org_invitations_email", columnList = "email"),
                @Index(name = "idx_org_invitations_org_id", columnList = "organization_id")
        }
)
public class OrganizationInvitation extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Column(nullable = false, length = 255)
    private String email;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "invited_by", nullable = false)
    private User invitedBy;

    @Column(name = "token", nullable = false, length = 1500)
    private String token;

    @Column(name = "token_hash", nullable = false, length = 64)
    private String tokenHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private InvitationStatus status = InvitationStatus.PENDING;

    @Column(nullable = false)
    private Instant invitedAt = Instant.now();

    @Column(nullable = false)
    private Instant expiresAt;

    private Instant respondedAt;
}

