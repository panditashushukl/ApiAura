package com.apiaura.apiaura.org.workspace.repository;

import com.apiaura.apiaura.org.workspace.entity.Workspace;
import com.apiaura.apiaura.foundation.common.enums.WorkspaceStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WorkspaceRepository
        extends JpaRepository<Workspace, UUID> {

    List<Workspace> findByOrganizationId(UUID organizationId);

    List<Workspace> findByOrganizationIdAndStatus(
            UUID organizationId,
            WorkspaceStatus status
    );

    Optional<Workspace> findByOrganizationIdAndSlug(
            UUID organizationId,
            String slug
    );

    boolean existsByOrganizationIdAndSlug(
            UUID organizationId,
            String slug
    );

    List<Workspace> findByCreatedById(UUID userId);
}
