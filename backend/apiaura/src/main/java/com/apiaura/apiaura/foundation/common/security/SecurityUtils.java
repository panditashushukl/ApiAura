package com.apiaura.apiaura.foundation.common.security;

import com.apiaura.apiaura.foundation.common.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;
import java.util.UUID;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static Optional<Authentication> getAuthentication() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return Optional.empty();
        }
        return Optional.of(auth);
    }

    public static UUID getCurrentUserId() {
        return getAuthentication()
                .map(auth -> {
                    try {
                        return UUID.fromString(auth.getName());
                    } catch (IllegalArgumentException exception) {
                        throw new UnauthorizedException("Invalid authenticated user");
                    }
                })
                .orElseThrow(() -> new UnauthorizedException("Authentication required"));
    }

    public static boolean hasAuthority(String authority) {
        if (authority == null) {
            return false;
        }
        if (isSuperAdmin()) {
            return true;
        }
        return getAuthentication()
                .map(Authentication::getAuthorities)
                .map(authorities -> authorities.stream()
                        .map(GrantedAuthority::getAuthority)
                        .anyMatch(a -> a.equalsIgnoreCase(authority) || "*".equals(a)))
                .orElse(false);
    }

    public static boolean hasRole(String role) {
        if (role == null) {
            return false;
        }
        String roleWithPrefix = role.startsWith("ROLE_") ? role : "ROLE_" + role;
        return getAuthentication()
                .map(Authentication::getAuthorities)
                .map(authorities -> authorities.stream()
                        .map(GrantedAuthority::getAuthority)
                        .anyMatch(a -> a.equalsIgnoreCase(roleWithPrefix) || a.equalsIgnoreCase(role)))
                .orElse(false);
    }

    public static boolean isSuperAdmin() {
        return hasRole("SUPER_ADMIN");
    }

    public static boolean isAdmin() {
        return isSuperAdmin() || hasRole("ADMIN");
    }
}
