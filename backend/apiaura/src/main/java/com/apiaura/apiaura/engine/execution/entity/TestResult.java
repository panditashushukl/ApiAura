package com.apiaura.apiaura.engine.execution.entity;

import com.apiaura.apiaura.foundation.common.entity.BaseEntity;
import com.apiaura.apiaura.engine.testing.entity.ApiTest;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(
        name = "test_results",
        indexes = {
                @Index(
                        name = "idx_test_result_execution",
                        columnList = "test_execution_id"
                ),
                @Index(
                        name = "idx_test_result_test",
                        columnList = "test_id"
                )
        }
)
public class TestResult extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "test_execution_id",
            nullable = false
    )
    private TestExecution testExecution;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "test_id",
            nullable = false
    )
    private ApiTest test;

    @Column(nullable = false, length = 30)
    private String status;

    @Column(
            name = "actual_value",
            columnDefinition = "TEXT"
    )
    private String actualValue;

    @Column(
            name = "expected_value",
            columnDefinition = "TEXT"
    )
    private String expectedValue;

    @Column(
            name = "error_message",
            columnDefinition = "TEXT"
    )
    private String errorMessage;

    private Long durationMs;
}