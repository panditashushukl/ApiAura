package com.apiaura.apiaura.identity.permission.entity;

import com.apiaura.apiaura.foundation.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(
        name = "permissions",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_permission_code",
                        columnNames = "code"
                )
        }
)
public class Permission extends BaseEntity {

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 150)
    private String code;

    @Column(length = 100)
    private String resource;

    @Column(length = 100)
    private String action;

    @Column(length = 500)
    private String description;

    @OneToMany(
            mappedBy = "permission",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private Set<RolePermission> roles = new HashSet<>();
}