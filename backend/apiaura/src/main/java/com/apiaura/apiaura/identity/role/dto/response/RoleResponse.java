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
    private Instant createdAt;
    private Instant updatedAt;

    public static RoleResponse from(Role role) {
        return RoleResponse.builder()
                .id(role.getId())
                .name(role.getName())
                .code(role.getCode())
                .description(role.getDescription())
                .systemRole(role.isSystemRole())
                .createdAt(role.getCreatedAt())
                .updatedAt(role.getUpdatedAt())
                .build();
    }
}
