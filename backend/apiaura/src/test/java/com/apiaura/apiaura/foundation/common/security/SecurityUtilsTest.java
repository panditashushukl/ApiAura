package com.apiaura.apiaura.foundation.common.security;

import com.apiaura.apiaura.foundation.common.exception.UnauthorizedException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class SecurityUtilsTest {

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void testGetCurrentUserId_WhenAuthenticated() {
        UUID userId = UUID.randomUUID();
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                userId.toString(), null, List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );
        SecurityContextHolder.getContext().setAuthentication(auth);

        assertEquals(userId, SecurityUtils.getCurrentUserId());
    }

    @Test
    void testGetCurrentUserId_WhenUnauthenticated_ThrowsException() {
        SecurityContextHolder.clearContext();

        assertThrows(UnauthorizedException.class, SecurityUtils::getCurrentUserId);
    }

    @Test
    void testHasRoleAndIsSuperAdmin() {
        UUID userId = UUID.randomUUID();
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                userId.toString(), null, List.of(
                        new SimpleGrantedAuthority("ROLE_SUPER_ADMIN"),
                        new SimpleGrantedAuthority("user:read")
                )
        );
        SecurityContextHolder.getContext().setAuthentication(auth);

        assertTrue(SecurityUtils.hasRole("SUPER_ADMIN"));
        assertTrue(SecurityUtils.hasRole("ROLE_SUPER_ADMIN"));
        assertTrue(SecurityUtils.isSuperAdmin());
        assertTrue(SecurityUtils.isAdmin());
        assertFalse(SecurityUtils.hasRole("GUEST"));
    }

    @Test
    void testHasAuthority() {
        UUID userId = UUID.randomUUID();
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                userId.toString(), null, List.of(
                        new SimpleGrantedAuthority("user:create"),
                        new SimpleGrantedAuthority("organization:delete")
                )
        );
        SecurityContextHolder.getContext().setAuthentication(auth);

        assertTrue(SecurityUtils.hasAuthority("user:create"));
        assertTrue(SecurityUtils.hasAuthority("organization:delete"));
        assertFalse(SecurityUtils.hasAuthority("user:delete"));
    }

    @Test
    void testHasAuthority_WhenSuperAdmin_BypassesAll() {
        UUID userId = UUID.randomUUID();
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                userId.toString(), null, List.of(
                        new SimpleGrantedAuthority("ROLE_SUPER_ADMIN")
                )
        );
        SecurityContextHolder.getContext().setAuthentication(auth);

        assertTrue(SecurityUtils.hasAuthority("any:arbitrary:permission"));
        assertTrue(SecurityUtils.hasAuthority("user:delete"));
    }

    @Test
    void testHasAuthority_WhenWildcardPresent() {
        UUID userId = UUID.randomUUID();
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                userId.toString(), null, List.of(
                        new SimpleGrantedAuthority("*")
                )
        );
        SecurityContextHolder.getContext().setAuthentication(auth);

        assertTrue(SecurityUtils.hasAuthority("anything:here"));
    }
}

