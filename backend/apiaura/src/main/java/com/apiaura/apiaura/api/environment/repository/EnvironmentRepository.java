package com.apiaura.apiaura.api.environment.repository;

import com.apiaura.apiaura.api.environment.entity.Environment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface EnvironmentRepository
        extends JpaRepository<Environment, UUID> {

    Page<Environment> findByWorkspaceId(
            UUID workspaceId,
            Pageable pageable
    );

    Optional<Environment> findByIdAndWorkspaceId(
            UUID id,
            UUID workspaceId
    );

    Optional<Environment> findByWorkspaceIdAndSlug(
            UUID workspaceId,
            String slug
    );

    boolean existsByWorkspaceIdAndSlug(
            UUID workspaceId,
            String slug
    );

    boolean existsByWorkspaceIdAndNameIgnoreCase(
            UUID workspaceId,
            String name
    );

    long countByWorkspaceId(UUID workspaceId);

    Optional<Environment> findByWorkspaceIdAndActiveTrue(
            UUID workspaceId
    );
}
