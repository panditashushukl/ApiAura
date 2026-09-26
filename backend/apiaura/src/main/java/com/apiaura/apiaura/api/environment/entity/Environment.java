package com.apiaura.apiaura.api.environment.entity;

import com.apiaura.apiaura.foundation.common.entity.BaseEntity;
import com.apiaura.apiaura.foundation.common.enums.EnvironmentStatus;
import com.apiaura.apiaura.identity.user.entity.User;
import com.apiaura.apiaura.org.workspace.entity.Workspace;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
        name = "environments",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_environment_workspace_slug",
                        columnNames = {"workspace_id", "slug"}
                )
        },
        indexes = {
                @Index(
                        name = "idx_environment_workspace_id",
                        columnList = "workspace_id"
                ),
                @Index(
                        name = "idx_environment_created_by",
                        columnList = "created_by"
                )
        }
)
public class Environment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 150)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EnvironmentStatus status = EnvironmentStatus.ACTIVE;

    @Column(nullable = false)
    private boolean active = false;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @OneToMany(
            mappedBy = "environment",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<EnvironmentVariable> variables = new ArrayList<>();
}