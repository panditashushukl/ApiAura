package com.apiaura.apiaura.engine.testing.repository;

import com.apiaura.apiaura.engine.testing.entity.TestExecution;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TestExecutionRepository
        extends JpaRepository<TestExecution, UUID> {

    Page<TestExecution> findByTestSuiteIdOrderByCreatedAtDesc(
            UUID testSuiteId,
            Pageable pageable
    );
}
