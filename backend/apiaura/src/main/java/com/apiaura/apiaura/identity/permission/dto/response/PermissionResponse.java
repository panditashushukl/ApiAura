package com.apiaura.apiaura.identity.permission.dto.response;

import com.apiaura.apiaura.identity.permission.entity.Permission;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class PermissionResponse {

    private UUID id;
    private String name;
    private String code;
    private String resource;
    private String action;
    private String description;
    private Instant createdAt;
    private Instant updatedAt;

    public static PermissionResponse from(
            Permission permission
    ) {
        return PermissionResponse.builder()
                .id(permission.getId())
                .name(permission.getName())
                .code(permission.getCode())
                .resource(permission.getResource())
                .action(permission.getAction())
                .description(permission.getDescription())
                .createdAt(permission.getCreatedAt())
                .updatedAt(permission.getUpdatedAt())
                .build();
    }
}
