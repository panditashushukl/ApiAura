package com.apiaura.apiaura.api.environment.entity;

import com.apiaura.apiaura.foundation.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
        name = "environment_variables",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_environment_variable_key",
                        columnNames = {"environment_id", "variable_key"}
                )
        },
        indexes = {
                @Index(
                        name = "idx_environment_variable_environment_id",
                        columnList = "environment_id"
                )
        }
)
public class EnvironmentVariable extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "environment_id", nullable = false)
    private Environment environment;

    @Column(name = "variable_key", nullable = false, length = 150)
    private String variableKey;

    @Column(name = "variable_value", columnDefinition = "TEXT")
    private String variableValue;

    @Column(name = "secret_value", columnDefinition = "TEXT")
    private String secretValue;

    @Column(nullable = false)
    private boolean secret = false;

    @Column(nullable = false)
    private boolean enabled = true;
}