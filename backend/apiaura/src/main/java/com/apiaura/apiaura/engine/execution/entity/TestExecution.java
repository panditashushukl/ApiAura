package com.apiaura.apiaura.engine.execution.entity;

import com.apiaura.apiaura.foundation.common.entity.BaseEntity;
import com.apiaura.apiaura.engine.testing.entity.TestSuite;
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
        name = "test_executions",
        indexes = {
                @Index(
                        name = "idx_test_execution_suite",
                        columnList = "test_suite_id"
                ),
                @Index(
                        name = "idx_test_execution_request",
                        columnList = "request_execution_id"
                )
        }
)
public class TestExecution extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "test_suite_id",
            nullable = false
    )
    private TestSuite testSuite;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_execution_id")
    private RequestExecution requestExecution;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;

    @Column(nullable = false, length = 30)
    private String status;

    @Column(nullable = false)
    private Integer totalTests = 0;

    @Column(nullable = false)
    private Integer passedTests = 0;

    @Column(nullable = false)
    private Integer failedTests = 0;

    private Long durationMs;

    @OneToMany(
            mappedBy = "testExecution",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private Set<TestResult> results = new HashSet<>();

    @Column(nullable = false)
    private java.time.Instant executedAt;
}