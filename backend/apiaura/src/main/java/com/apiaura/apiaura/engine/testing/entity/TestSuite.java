package com.apiaura.apiaura.engine.testing.entity;

import com.apiaura.apiaura.api.collection.entity.Collection;
import com.apiaura.apiaura.foundation.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(
        name = "test_suites",
        indexes = {
                @Index(
                        name = "idx_test_suite_collection",
                        columnList = "collection_id"
                )
        }
)
public class TestSuite extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "collection_id",
            nullable = false
    )
    private Collection collection;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private boolean enabled = true;

    @OneToMany(
            mappedBy = "testSuite",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @OrderBy("sortOrder ASC")
    private List<ApiTest> tests = new ArrayList<>();
}