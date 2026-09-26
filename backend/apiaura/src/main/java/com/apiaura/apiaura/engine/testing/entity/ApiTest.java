package com.apiaura.apiaura.engine.testing.entity;

import com.apiaura.apiaura.foundation.common.entity.BaseEntity;
import com.apiaura.apiaura.api.request.entity.ApiRequest;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(
        name = "api_tests",
        indexes = {
                @Index(
                        name = "idx_api_test_suite",
                        columnList = "test_suite_id"
                ),
                @Index(
                        name = "idx_api_test_request",
                        columnList = "request_id"
                )
        }
)
public class ApiTest extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "test_suite_id",
            nullable = false
    )
    private TestSuite testSuite;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "request_id",
            nullable = false
    )
    private ApiRequest request;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(nullable = false)
    private int sortOrder = 0;

    @OneToMany(
            mappedBy = "apiTest",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @OrderBy("sortOrder ASC")
    private List<TestAssertion> assertions = new ArrayList<>();
}