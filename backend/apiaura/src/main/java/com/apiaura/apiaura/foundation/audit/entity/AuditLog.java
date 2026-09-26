package com.apiaura.apiaura.foundation.audit.entity;

import com.apiaura.apiaura.foundation.common.entity.BaseEntity;
import com.apiaura.apiaura.identity.user.entity.User;
import com.apiaura.apiaura.org.workspace.entity.Workspace;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(
    name = "audit_logs",
    indexes = {
        @Index(
            name = "idx_audit_user",
            columnList = "user_id"
        ),
        @Index(
            name = "idx_audit_workspace",
            columnList = "workspace_id"
        ),
        @Index(
            name = "idx_audit_action",
            columnList = "action"
        ),
        @Index(
            name = "idx_audit_created_at",
            columnList = "created_at"
        )
    }
)
public class AuditLog extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id")
    private Workspace workspace;

    @Column(nullable = false, length = 100)
    private String action;

    @Column(
        name = "resource_type",
        length = 100
    )
    private String resourceType;

    @Column(name = "resource_id")
    private java.util.UUID resourceId;

    @Column(name = "ip_address", length = 100)
    private String ipAddress;

    @Column(
        name = "user_agent",
        columnDefinition = "TEXT"
    )
    private String userAgent;

    @Column(
        name = "metadata",
        columnDefinition = "TEXT"
    )
    private String metadata;
}
