package com.apiaura.apiaura.engine.testing.dto.response;

import com.apiaura.apiaura.engine.testing.entity.TestExecution;
import com.apiaura.apiaura.engine.testing.enums.TestExecutionStatus;

import java.time.Instant;
import java.util.UUID;

public record TestExecutionResponse(

        UUID id,

        UUID testSuiteId,

        UUID requestExecutionId,

        TestExecutionStatus status,

        int totalTests,

        int passedTests,

        int failedTests,

        long durationMs,

        Instant createdAt

) {

    public static TestExecutionResponse from(
            TestExecution execution
    ) {

        return new TestExecutionResponse(
                execution.getId(),
                execution.getTestSuite().getId(),
                execution.getRequestExecution() == null
                        ? null
                        : execution
                                .getRequestExecution()
                                .getId(),
                execution.getStatus(),
                execution.getTotalTests(),
                execution.getPassedTests(),
                execution.getFailedTests(),
                execution.getDurationMs(),
                execution.getCreatedAt()
        );
    }
}
