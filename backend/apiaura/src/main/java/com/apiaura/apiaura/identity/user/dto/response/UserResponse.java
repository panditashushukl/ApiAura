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

    @Getter
    @Builder
    public static class UserWorkspaceInfo {
        private UUID id;
        private String name;
        private String slug;
        private boolean isMember;
    }

    private UUID id;
    private String name;
    private String email;
    private String mobileNumber;
    private UUID organizationId;
    private String organizationName;
    private String organizationSlug;
    private List<UserWorkspaceInfo> workspaces;
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
        String orgSlug = null;
        List<UserWorkspaceInfo> workspaceInfos = new ArrayList<>();

        try {
            if (user.getOrganization() != null) {
                orgId = user.getOrganization().getId();
                orgName = user.getOrganization().getName();
                orgSlug = user.getOrganization().getSlug();
            }

            java.util.Set<UUID> addedWsIds = new java.util.HashSet<>();

            if (user.getWorkspaceMemberships() != null) {
                user.getWorkspaceMemberships().forEach(wm -> {
                    if (wm.getWorkspace() != null && addedWsIds.add(wm.getWorkspace().getId())) {
                        workspaceInfos.add(UserWorkspaceInfo.builder()
                                .id(wm.getWorkspace().getId())
                                .name(wm.getWorkspace().getName())
                                .slug(wm.getWorkspace().getSlug())
                                .isMember("ACTIVE".equalsIgnoreCase(wm.getStatus()))
                                .build());
                    }
                });
            }

            if (user.getOrganization() != null && user.getOrganization().getWorkspaces() != null) {
                user.getOrganization().getWorkspaces().forEach(ws -> {
                    if (addedWsIds.add(ws.getId())) {
                        boolean isMember = false;
                        if (user.getWorkspaceMemberships() != null) {
                            isMember = user.getWorkspaceMemberships().stream()
                                    .anyMatch(wm -> wm.getWorkspace() != null && wm.getWorkspace().getId().equals(ws.getId()) && "ACTIVE".equalsIgnoreCase(wm.getStatus()));
                        }
                        if (ws.getCreatedBy() != null && ws.getCreatedBy().getId().equals(user.getId())) {
                            isMember = true;
                        }
                        workspaceInfos.add(UserWorkspaceInfo.builder()
                                .id(ws.getId())
                                .name(ws.getName())
                                .slug(ws.getSlug())
                                .isMember(isMember)
                                .build());
                    }
                });
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
                .organizationSlug(orgSlug)
                .workspaces(workspaceInfos)
                .status(user.getStatus())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .roles(roleCodes)
                .permissions(permissionCodes)
                .build();
    }
}
