package com.apiaura.apiaura.api.collection.entity;

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
        name = "collection_variables",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_collection_variable_key",
                        columnNames = {"collection_id", "variable_key"}
                )
        },
        indexes = {
                @Index(
                        name = "idx_collection_variable_collection_id",
                        columnList = "collection_id"
                )
        }
)
public class CollectionVariable extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "collection_id", nullable = false)
    private Collection collection;

    @Column(name = "variable_key", nullable = false, length = 150)
    private String variableKey;

    @Column(name = "variable_value", columnDefinition = "TEXT")
    private String variableValue;

    @Column(nullable = false)
    private boolean secret = false;

    @Column(nullable = false)
    private boolean enabled = true;
}