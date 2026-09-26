package com.apiaura.apiaura.foundation.audit.service;

import com.apiaura.apiaura.foundation.audit.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface AuditService {

    void record(
            UUID userId,
            UUID workspaceId,
            String action,
            String resourceType,
            UUID resourceId,
            String ipAddress,
            String userAgent,
            String metadata
    );

    Page<AuditLog> getWorkspaceLogs(
            UUID workspaceId,
            Pageable pageable
    );

    Page<AuditLog> getUserLogs(
            UUID userId,
            Pageable pageable
    );
}
