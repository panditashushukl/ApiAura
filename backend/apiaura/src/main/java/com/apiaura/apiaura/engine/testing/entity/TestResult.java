package com.apiaura.apiaura.engine.testing.entity;

import com.apiaura.apiaura.foundation.common.entity.BaseEntity;
import com.apiaura.apiaura.engine.testing.enums.TestResultStatus;
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
                        name = "idx_test_result_assertion",
                        columnList = "assertion_id"
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
            name = "assertion_id",
            nullable = false
    )
    private TestAssertion assertion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TestResultStatus status;

    @Column(columnDefinition = "TEXT")
    private String actualValue;

    @Column(columnDefinition = "TEXT")
    private String expectedValue;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    private long durationMs;
}
