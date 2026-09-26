package com.apiaura.apiaura.engine.testing.repository;

import com.apiaura.apiaura.engine.testing.entity.TestSuite;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TestSuiteRepository
        extends JpaRepository<TestSuite, UUID> {

    Page<TestSuite> findByCollectionId(
            UUID collectionId,
            Pageable pageable
    );

    Optional<TestSuite> findByIdAndCollectionId(
            UUID id,
            UUID collectionId
    );

    boolean existsByCollectionIdAndNameIgnoreCase(
            UUID collectionId,
            String name
    );
}
