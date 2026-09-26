package com.apiaura.apiaura.org.workspace.entity;

import com.apiaura.apiaura.api.collection.entity.Collection;
import com.apiaura.apiaura.foundation.common.entity.BaseEntity;
import com.apiaura.apiaura.foundation.common.enums.WorkspaceStatus;
import com.apiaura.apiaura.org.organization.entity.Organization;
import com.apiaura.apiaura.identity.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(
        name = "workspaces",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_workspace_org_slug",
                        columnNames = {"organization_id", "slug"}
                )
        }
)
public class Workspace extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "organization_id",
            nullable = false
    )
    private Organization organization;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 150)
    private String slug;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private WorkspaceStatus status = WorkspaceStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @OneToMany(
            mappedBy = "workspace",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private Set<WorkspaceMember> members = new HashSet<>();

    @OneToMany(
            mappedBy = "workspace",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private Set<Collection> collections = new HashSet<>();
}