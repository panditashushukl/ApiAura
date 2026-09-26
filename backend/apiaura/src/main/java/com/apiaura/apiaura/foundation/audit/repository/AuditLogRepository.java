package com.apiaura.apiaura.foundation.audit.repository;

import com.apiaura.apiaura.foundation.audit.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AuditLogRepository
        extends JpaRepository<AuditLog, UUID> {

    Page<AuditLog> findByWorkspaceId(
            UUID workspaceId,
            Pageable pageable
    );

    Page<AuditLog> findByUserId(
            UUID userId,
            Pageable pageable
    );

    Page<AuditLog> findByWorkspaceIdAndAction(
            UUID workspaceId,
            String action,
            Pageable pageable
    );

    Page<AuditLog> findByWorkspaceIdAndResourceType(
            UUID workspaceId,
            String resourceType,
            Pageable pageable
    );
}
