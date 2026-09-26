package com.apiaura.apiaura.identity.auth.entity;

import com.apiaura.apiaura.foundation.common.entity.BaseEntity;
import com.apiaura.apiaura.foundation.common.enums.AuthType;
import com.apiaura.apiaura.identity.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(
        name = "auth_configs",
        indexes = {
                @Index(
                        name = "idx_auth_config_created_by",
                        columnList = "created_by"
                )
        }
)
public class AuthConfig extends BaseEntity {

    @Column(nullable = false, length = 150)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "auth_type",
            nullable = false,
            length = 30
    )
    private AuthType authType;

    /**
     * Flexible authentication configuration.
     * Examples:
     * BASIC:
     * {
     *   "username": "...",
     *   "password": "..."
     * }
     * BEARER:
     * {
     *   "token": "..."
     * }
     * API_KEY:
     * {
     *   "key": "...",
     *   "value": "...",
     *   "location": "HEADER"
     * }
     */
    @Column(
            name = "config_json",
            columnDefinition = "TEXT"
    )
    private String configJson;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "created_by",
            nullable = false
    )
    private User createdBy;
}