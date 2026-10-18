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
    private String organizationName;
    private String name;
    private String slug;
    private String description;
    private WorkspaceStatus status;
    private UUID createdBy;
    private String createdByName;
    private String createdByEmail;
    private Instant createdAt;
    private Instant updatedAt;

    public static WorkspaceResponse from(
            Workspace workspace
    ) {
        String orgName = workspace.getOrganization() != null ? workspace.getOrganization().getName() : null;
        String createdByName = workspace.getCreatedBy() != null ? workspace.getCreatedBy().getName() : null;
        String createdByEmail = workspace.getCreatedBy() != null ? workspace.getCreatedBy().getEmail() : null;

        return WorkspaceResponse.builder()
                .id(workspace.getId())
                .organizationId(
                        workspace.getOrganization() != null
                                ? workspace.getOrganization().getId()
                                : null
                )
                .organizationName(orgName)
                .name(workspace.getName())
                .slug(workspace.getSlug())
                .description(workspace.getDescription())
                .status(workspace.getStatus())
                .createdBy(
                        workspace.getCreatedBy() != null
                                ? workspace.getCreatedBy().getId()
                                : null
                )
                .createdByName(createdByName)
                .createdByEmail(createdByEmail)
                .createdAt(workspace.getCreatedAt())
                .updatedAt(workspace.getUpdatedAt())
                .build();
    }
}
