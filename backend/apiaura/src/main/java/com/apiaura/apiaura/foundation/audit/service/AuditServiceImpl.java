package com.apiaura.apiaura.foundation.audit.service;

import com.apiaura.apiaura.foundation.audit.entity.AuditLog;
import com.apiaura.apiaura.foundation.audit.repository.AuditLogRepository;
import com.apiaura.apiaura.identity.user.entity.User;
import com.apiaura.apiaura.identity.user.repository.UserRepository;
import com.apiaura.apiaura.org.workspace.entity.Workspace;
import com.apiaura.apiaura.org.workspace.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditServiceImpl implements AuditService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final WorkspaceRepository workspaceRepository;

    @Override
    @Transactional
    public void record(
            UUID userId,
            UUID workspaceId,
            String action,
            String resourceType,
            UUID resourceId,
            String ipAddress,
            String userAgent,
            String metadata
    ) {

        AuditLog log = new AuditLog();

        if (userId != null) {
            User user = userRepository.findById(userId)
                    .orElse(null);

            log.setUser(user);
        }

        if (workspaceId != null) {
            Workspace workspace =
                    workspaceRepository.findById(workspaceId)
                            .orElse(null);

            log.setWorkspace(workspace);
        }

        log.setAction(action);
        log.setResourceType(resourceType);
        log.setResourceId(resourceId);
        log.setIpAddress(ipAddress);
        log.setUserAgent(userAgent);
        log.setMetadata(metadata);

        auditLogRepository.save(log);
    }

    @Override
    public Page<AuditLog> getWorkspaceLogs(
            UUID workspaceId,
            Pageable pageable
    ) {
        return auditLogRepository.findByWorkspaceId(
                workspaceId,
                pageable
        );
    }

    @Override
    public Page<AuditLog> getUserLogs(
            UUID userId,
            Pageable pageable
    ) {
        return auditLogRepository.findByUserId(
                userId,
                pageable
        );
    }
}
