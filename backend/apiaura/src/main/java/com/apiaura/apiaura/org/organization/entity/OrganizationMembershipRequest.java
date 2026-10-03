package com.apiaura.apiaura.org.organization.entity;

import com.apiaura.apiaura.foundation.common.entity.BaseEntity;
import com.apiaura.apiaura.foundation.common.enums.MembershipRequestStatus;
import com.apiaura.apiaura.identity.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "organization_membership_requests")
public class OrganizationMembershipRequest extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private MembershipRequestStatus status = MembershipRequestStatus.PENDING;

    @Column(length = 500)
    private String message;

    @Column(nullable = false)
    private Instant requestedAt = Instant.now();

    private Instant reviewedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;
}
