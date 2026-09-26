package com.apiaura.apiaura.org.workspace.dto.response;

import com.apiaura.apiaura.foundation.common.enums.WorkspaceStatus;
import com.apiaura.apiaura.org.workspace.entity.Workspace;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class WorkspaceResponse {

    private UUID id;
    private UUID organizationId;
    private String name;
    private String slug;
    private String description;
    private WorkspaceStatus status;
    private UUID createdBy;
    private Instant createdAt;
    private Instant updatedAt;

    public static WorkspaceResponse from(
            Workspace workspace
    ) {
        return WorkspaceResponse.builder()
                .id(workspace.getId())
                .organizationId(
                        workspace.getOrganization().getId()
                )
                .name(workspace.getName())
                .slug(workspace.getSlug())
                .description(workspace.getDescription())
                .status(workspace.getStatus())
                .createdBy(
                        workspace.getCreatedBy() != null
                                ? workspace.getCreatedBy().getId()
                                : null
                )
                .createdAt(workspace.getCreatedAt())
                .updatedAt(workspace.getUpdatedAt())
                .build();
    }
}
