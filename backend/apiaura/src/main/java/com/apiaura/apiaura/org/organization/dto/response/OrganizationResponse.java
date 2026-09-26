package com.apiaura.apiaura.org.organization.dto.response;

import com.apiaura.apiaura.org.organization.entity.Organization;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class OrganizationResponse {

    private UUID id;
    private String name;
    private String slug;
    private UUID ownerId;
    private Instant createdAt;
    private Instant updatedAt;

    public static OrganizationResponse from(
            Organization organization
    ) {
        return OrganizationResponse.builder()
                .id(organization.getId())
                .name(organization.getName())
                .slug(organization.getSlug())
                .ownerId(organization.getOwner().getId())
                .createdAt(organization.getCreatedAt())
                .updatedAt(organization.getUpdatedAt())
                .build();
    }
}
