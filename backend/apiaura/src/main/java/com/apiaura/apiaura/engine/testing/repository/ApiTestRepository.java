package com.apiaura.apiaura.engine.testing.repository;

import com.apiaura.apiaura.engine.testing.entity.ApiTest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ApiTestRepository
        extends JpaRepository<ApiTest, UUID> {

    List<ApiTest> findByTestSuiteIdOrderBySortOrderAsc(
            UUID testSuiteId
    );

    Optional<ApiTest> findByIdAndTestSuiteId(
            UUID id,
            UUID testSuiteId
    );

    boolean existsByTestSuiteIdAndNameIgnoreCase(
            UUID testSuiteId,
            String name
    );
}
