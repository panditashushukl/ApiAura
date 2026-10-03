package com.apiaura.apiaura.identity.user.dto.response;

import com.apiaura.apiaura.foundation.common.enums.UserStatus;
import com.apiaura.apiaura.identity.user.entity.User;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class UserResponse {

    private UUID id;
    private String name;
    private String email;
    private String mobileNumber;
    private UUID organizationId;
    private String organizationName;
    private UserStatus status;
    private Instant lastLoginAt;
    private Instant createdAt;
    private Instant updatedAt;
    private List<String> roles;
    private List<String> permissions;

    public static UserResponse from(User user) {
        List<String> roleCodes = new ArrayList<>();
        List<String> permissionCodes = new ArrayList<>();

        try {
            if (user.getRoles() != null) {
                user.getRoles().forEach(ur -> {
                    if (ur.getRole() != null) {
                        if (ur.getRole().getCode() != null) {
                            roleCodes.add(ur.getRole().getCode());
                        }
                        if (ur.getRole().getPermissions() != null) {
                            ur.getRole().getPermissions().forEach(rp -> {
                                if (rp.getPermission() != null && rp.getPermission().getCode() != null) {
                                    permissionCodes.add(rp.getPermission().getCode());
                                }
                            });
                        }
                    }
                });
            }
        } catch (Exception ignored) {
            // Lazy loading fallback
        }

        if (roleCodes.isEmpty()) {
            roleCodes.add("GUEST");
        }

        UUID orgId = null;
        String orgName = null;
        try {
            if (user.getOrganization() != null) {
                orgId = user.getOrganization().getId();
                orgName = user.getOrganization().getName();
            }
        } catch (Exception ignored) {
        }

        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .mobileNumber(user.getMobileNumber())
                .organizationId(orgId)
                .organizationName(orgName)
                .status(user.getStatus())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .roles(roleCodes)
                .permissions(permissionCodes)
                .build();
    }
}
