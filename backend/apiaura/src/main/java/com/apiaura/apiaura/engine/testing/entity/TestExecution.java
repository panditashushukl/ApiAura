package com.apiaura.apiaura.engine.testing.entity;

import com.apiaura.apiaura.foundation.common.entity.BaseEntity;
import com.apiaura.apiaura.api.environment.entity.Environment;
import com.apiaura.apiaura.engine.execution.entity.RequestExecution;
import com.apiaura.apiaura.testing.enums.TestExecutionStatus;
import com.apiaura.apiaura.identity.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

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
                ),
                @Index(
                        name = "idx_test_execution_user",
                        columnList = "executed_by"
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "environment_id")
    private Environment environment;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "executed_by",
            nullable = false
    )
    private User executedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TestExecutionStatus status;

    @Column(nullable = false)
    private int totalTests;

    @Column(nullable = false)
    private int passedTests;

    @Column(nullable = false)
    private int failedTests;

    @Column(nullable = false)
    private long durationMs;

    @OneToMany(
            mappedBy = "testExecution",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<TestResult> results = new ArrayList<>();
}
