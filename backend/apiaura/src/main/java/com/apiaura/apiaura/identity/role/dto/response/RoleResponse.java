package com.apiaura.apiaura.identity.role.dto.response;

import com.apiaura.apiaura.identity.role.entity.Role;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class RoleResponse {

    private UUID id;
    private String name;
    private String code;
    private String description;
    private boolean systemRole;
    private UUID organizationId;
    private String organizationName;
    private Instant createdAt;
    private Instant updatedAt;

    public static RoleResponse from(Role role) {
        UUID orgId = null;
        String orgName = null;
        try {
            if (role.getOrganization() != null) {
                orgId = role.getOrganization().getId();
                orgName = role.getOrganization().getName();
            }
        } catch (Exception ignored) {}

        return RoleResponse.builder()
                .id(role.getId())
                .name(role.getName())
                .code(role.getCode())
                .description(role.getDescription())
                .systemRole(role.isSystemRole())
                .organizationId(orgId)
                .organizationName(orgName)
                .createdAt(role.getCreatedAt())
                .updatedAt(role.getUpdatedAt())
                .build();
    }
}

