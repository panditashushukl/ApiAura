package com.apiaura.apiaura.engine.testing.repository;

import com.apiaura.apiaura.engine.testing.entity.TestResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TestResultRepository
        extends JpaRepository<TestResult, UUID> {

    List<TestResult> findByTestExecutionIdOrderByCreatedAtAsc(
            UUID testExecutionId
    );
}
