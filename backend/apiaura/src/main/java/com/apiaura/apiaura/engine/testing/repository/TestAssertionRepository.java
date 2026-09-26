package com.apiaura.apiaura.engine.testing.repository;

import com.apiaura.apiaura.engine.testing.entity.TestAssertion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TestAssertionRepository
        extends JpaRepository<TestAssertion, UUID> {

    List<TestAssertion> findByApiTestIdOrderBySortOrderAsc(
            UUID apiTestId
    );

    long countByApiTestId(UUID apiTestId);

    void deleteByApiTestId(UUID apiTestId);
}
