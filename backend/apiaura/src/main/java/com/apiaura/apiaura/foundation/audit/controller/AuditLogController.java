package com.apiaura.apiaura.foundation.audit.controller;

import com.apiaura.apiaura.foundation.audit.entity.AuditLog;
import com.apiaura.apiaura.foundation.audit.service.AuditService;
import com.apiaura.apiaura.foundation.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditService auditService;

    @GetMapping("/workspaces/{workspaceId}/audit-logs")
    public ApiResponse<Page<AuditLog>> getWorkspaceLogs(
            @PathVariable UUID workspaceId,
            Pageable pageable
    ) {

        return ApiResponse.success(
                auditService.getWorkspaceLogs(
                        workspaceId,
                        pageable
                )
        );
    }

    @GetMapping("/audit-logs/user/{userId}")
    public ApiResponse<Page<AuditLog>> getUserLogs(
            @PathVariable UUID userId,
            Pageable pageable
    ) {

        return ApiResponse.success(
                auditService.getUserLogs(
                        userId,
                        pageable
                )
        );
    }
}
