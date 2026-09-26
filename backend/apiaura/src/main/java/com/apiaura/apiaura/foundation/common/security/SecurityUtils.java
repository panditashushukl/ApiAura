package com.apiaura.apiaura.foundation.common.security;

import com.apiaura.apiaura.foundation.common.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static UUID getCurrentUserId() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new UnauthorizedException(
                    "Authentication required"
            );
        }

        try {
            return UUID.fromString(
                    authentication.getName()
            );
        } catch (IllegalArgumentException exception) {
            throw new UnauthorizedException(
                    "Invalid authenticated user"
            );
        }
    }
}