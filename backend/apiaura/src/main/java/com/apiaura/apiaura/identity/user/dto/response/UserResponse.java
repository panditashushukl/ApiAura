package com.apiaura.apiaura.identity.user.dto.response;

import com.apiaura.apiaura.foundation.common.enums.UserStatus;
import com.apiaura.apiaura.identity.user.entity.User;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;
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

    @Getter
    @Builder
    public static class UserOrganizationInfo {
        private UUID id;
        private String name;
        private String slug;
    }

    private UUID id;
    private String name;
    private String email;
    private String mobileNumber;
    private UUID organizationId;
    private String organizationName;
    private String organizationSlug;
    private List<UserOrganizationInfo> organizations;
    private List<UserWorkspaceInfo> workspaces;
    private UserStatus status;
    private Instant lastLoginAt;
    private Instant createdAt;
    private Instant updatedAt;
    private List<String> roles;
    private List<String> permissions;

    public static UserResponse from(User user) {
        Set<String> roleCodes = new LinkedHashSet<>();
        Set<String> permissionCodes = new TreeSet<>();

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
                                    String code = rp.getPermission().getCode();
                                    if (!"*".equals(code) && !"*".equals(rp.getPermission().getResource()) && !"*".equals(rp.getPermission().getAction())) {
                                        permissionCodes.add(code);
                                    }
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
        List<UserOrganizationInfo> organizationInfos = new ArrayList<>();

        try {
            if (user.getOrganization() != null) {
                orgId = user.getOrganization().getId();
                orgName = user.getOrganization().getName();
                orgSlug = user.getOrganization().getSlug();
            } else if (user.getOrganizations() != null && !user.getOrganizations().isEmpty()) {
                var first = user.getOrganizations().iterator().next();
                if (first != null) {
                    orgId = first.getId();
                    orgName = first.getName();
                    orgSlug = first.getSlug();
                }
            } else if (user.getOwnedOrganizations() != null && !user.getOwnedOrganizations().isEmpty()) {
                var first = user.getOwnedOrganizations().iterator().next();
                if (first != null) {
                    orgId = first.getId();
                    orgName = first.getName();
                    orgSlug = first.getSlug();
                }
            }

            java.util.Set<UUID> addedOrgIds = new java.util.HashSet<>();

            if (user.getOwnedOrganizations() != null) {
                user.getOwnedOrganizations().forEach(o -> {
                    if (o != null && o.getId() != null && addedOrgIds.add(o.getId())) {
                        organizationInfos.add(UserOrganizationInfo.builder()
                                .id(o.getId())
                                .name(o.getName())
                                .slug(o.getSlug())
                                .build());
                    }
                });
            }
            if (user.getOrganizations() != null) {
                user.getOrganizations().forEach(o -> {
                    if (o != null && o.getId() != null && addedOrgIds.add(o.getId())) {
                        organizationInfos.add(UserOrganizationInfo.builder()
                                .id(o.getId())
                                .name(o.getName())
                                .slug(o.getSlug())
                                .build());
                    }
                });
            }
            if (user.getOrganization() != null && user.getOrganization().getId() != null && addedOrgIds.add(user.getOrganization().getId())) {
                organizationInfos.add(UserOrganizationInfo.builder()
                        .id(user.getOrganization().getId())
                        .name(user.getOrganization().getName())
                        .slug(user.getOrganization().getSlug())
                        .build());
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
                .organizations(organizationInfos)
                .workspaces(workspaceInfos)
                .status(user.getStatus())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .roles(new ArrayList<>(roleCodes))
                .permissions(new ArrayList<>(permissionCodes))
                .build();
    }
}
