package com.apiaura.apiaura.identity.user.dto.response;

import com.apiaura.apiaura.foundation.common.enums.UserStatus;
import com.apiaura.apiaura.identity.permission.entity.Permission;
import com.apiaura.apiaura.identity.permission.entity.RolePermission;
import com.apiaura.apiaura.identity.role.entity.Role;
import com.apiaura.apiaura.identity.role.entity.UserRole;
import com.apiaura.apiaura.identity.user.entity.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class UserResponseTest {

    @Test
    @DisplayName("Should deduplicate permissions and roles when multiple roles share permissions")
    void shouldDeduplicatePermissionsWhenMultipleRolesAssigned() {
        // Arrange
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setName("Test User");
        user.setEmail("test@apiaura.com");
        user.setStatus(UserStatus.ACTIVE);
        user.setCreatedAt(Instant.now());
        user.setUpdatedAt(Instant.now());

        Permission perm1 = new Permission();
        perm1.setId(UUID.randomUUID());
        perm1.setCode("environment:create");

        Permission perm2 = new Permission();
        perm2.setId(UUID.randomUUID());
        perm2.setCode("user:update");

        Permission perm3 = new Permission();
        perm3.setId(UUID.randomUUID());
        perm3.setCode("api:create");

        // Role 1 (SUPER_ADMIN) has perm1, perm2, perm3
        Role role1 = new Role();
        role1.setId(UUID.randomUUID());
        role1.setCode("SUPER_ADMIN");
        role1.setName("Super Admin");

        RolePermission rp11 = new RolePermission();
        rp11.setRole(role1);
        rp11.setPermission(perm1);

        RolePermission rp12 = new RolePermission();
        rp12.setRole(role1);
        rp12.setPermission(perm2);

        RolePermission rp13 = new RolePermission();
        rp13.setRole(role1);
        rp13.setPermission(perm3);

        role1.setPermissions(new HashSet<>(Set.of(rp11, rp12, rp13)));

        // Role 2 (ADMIN) also has perm1, perm2 (overlapping)
        Role role2 = new Role();
        role2.setId(UUID.randomUUID());
        role2.setCode("ADMIN");
        role2.setName("Admin");

        RolePermission rp21 = new RolePermission();
        rp21.setRole(role2);
        rp21.setPermission(perm1);

        RolePermission rp22 = new RolePermission();
        rp22.setRole(role2);
        rp22.setPermission(perm2);

        role2.setPermissions(new HashSet<>(Set.of(rp21, rp22)));

        UserRole userRole1 = new UserRole();
        userRole1.setUser(user);
        userRole1.setRole(role1);

        UserRole userRole2 = new UserRole();
        userRole2.setUser(user);
        userRole2.setRole(role2);

        user.setRoles(new HashSet<>(Set.of(userRole1, userRole2)));

        // Act
        UserResponse response = UserResponse.from(user);

        // Assert
        assertThat(response.getRoles())
                .containsExactlyInAnyOrder("SUPER_ADMIN", "ADMIN");

        // Overlapping permissions must not be duplicated and should be sorted
        assertThat(response.getPermissions())
                .hasSize(3)
                .containsExactly("api:create", "environment:create", "user:update");
    }

    @Test
    @DisplayName("Should default role to GUEST when user has no roles")
    void shouldDefaultToGuestWhenNoRoles() {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setName("New User");
        user.setEmail("guest@apiaura.com");
        user.setStatus(UserStatus.ACTIVE);

        UserResponse response = UserResponse.from(user);

        assertThat(response.getRoles()).containsExactly("GUEST");
        assertThat(response.getPermissions()).isEmpty();
    }

    @Test
    @DisplayName("Should hide wildcard permission (*) from user response permissions list")
    void shouldFilterWildcardPermissionFromResponse() {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setName("Super Admin User");
        user.setEmail("super@apiaura.com");
        user.setStatus(UserStatus.ACTIVE);

        Permission wildcardPerm = new Permission();
        wildcardPerm.setId(UUID.randomUUID());
        wildcardPerm.setCode("*");
        wildcardPerm.setResource("*");
        wildcardPerm.setAction("*");

        Permission regularPerm = new Permission();
        regularPerm.setId(UUID.randomUUID());
        regularPerm.setCode("user:read");
        regularPerm.setResource("user");
        regularPerm.setAction("read");

        Role role = new Role();
        role.setId(UUID.randomUUID());
        role.setCode("SUPER_ADMIN");
        role.setName("Super Admin");

        RolePermission rp1 = new RolePermission();
        rp1.setRole(role);
        rp1.setPermission(wildcardPerm);

        RolePermission rp2 = new RolePermission();
        rp2.setRole(role);
        rp2.setPermission(regularPerm);

        role.setPermissions(new HashSet<>(Set.of(rp1, rp2)));

        UserRole userRole = new UserRole();
        userRole.setUser(user);
        userRole.setRole(role);

        user.setRoles(new HashSet<>(Set.of(userRole)));

        UserResponse response = UserResponse.from(user);

        assertThat(response.getPermissions())
                .doesNotContain("*")
                .containsExactly("user:read");
    }

    @Test
    @DisplayName("Should include all organizations when user belongs to multiple organizations")
    void shouldIncludeAllOrganizations() {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setName("Multi Org User");
        user.setEmail("multiorg@apiaura.com");
        user.setStatus(UserStatus.ACTIVE);

        com.apiaura.apiaura.org.organization.entity.Organization org1 = new com.apiaura.apiaura.org.organization.entity.Organization();
        org1.setId(UUID.randomUUID());
        org1.setName("Org 1");
        org1.setSlug("org-1");

        com.apiaura.apiaura.org.organization.entity.Organization org2 = new com.apiaura.apiaura.org.organization.entity.Organization();
        org2.setId(UUID.randomUUID());
        org2.setName("Org 2");
        org2.setSlug("org-2");

        // User belongs to org1 in set, and currently active org2 in single reference
        user.setOrganizations(new HashSet<>(Set.of(org1)));
        user.setOrganization(org2);

        UserResponse response = UserResponse.from(user);

        assertThat(response.getOrganizations()).hasSize(2);
        assertThat(response.getOrganizations())
                .extracting(UserResponse.UserOrganizationInfo::getId)
                .containsExactlyInAnyOrder(org1.getId(), org2.getId());
    }

    @Test
    @DisplayName("Should include owned organizations in organizations list even if not in organizations set")
    void shouldIncludeOwnedOrganizations() {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setName("Owner User");
        user.setEmail("owner@apiaura.com");
        user.setStatus(UserStatus.ACTIVE);

        com.apiaura.apiaura.org.organization.entity.Organization ownedOrg1 = new com.apiaura.apiaura.org.organization.entity.Organization();
        ownedOrg1.setId(UUID.randomUUID());
        ownedOrg1.setName("Owned Org 1");
        ownedOrg1.setSlug("owned-org-1");

        com.apiaura.apiaura.org.organization.entity.Organization ownedOrg2 = new com.apiaura.apiaura.org.organization.entity.Organization();
        ownedOrg2.setId(UUID.randomUUID());
        ownedOrg2.setName("Owned Org 2");
        ownedOrg2.setSlug("owned-org-2");

        user.setOwnedOrganizations(new HashSet<>(Set.of(ownedOrg1, ownedOrg2)));
        user.setOrganization(ownedOrg1);

        UserResponse response = UserResponse.from(user);

        assertThat(response.getOrganizations()).hasSize(2);
        assertThat(response.getOrganizations())
                .extracting(UserResponse.UserOrganizationInfo::getId)
                .containsExactlyInAnyOrder(ownedOrg1.getId(), ownedOrg2.getId());
    }
}

