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
}

