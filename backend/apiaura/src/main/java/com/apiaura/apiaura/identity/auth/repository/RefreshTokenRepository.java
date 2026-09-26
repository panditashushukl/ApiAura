package com.apiaura.apiaura.identity.auth.repository;

import com.apiaura.apiaura.identity.auth.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository
        extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    boolean existsByTokenHash(String tokenHash);

    List<RefreshToken> findByUserId(UUID userId);

    List<RefreshToken> findByUserIdAndRevokedAtIsNull(
            UUID userId
    );

    Optional<RefreshToken> findByTokenHashAndRevokedAtIsNull(
            String tokenHash
    );

    void deleteByUserId(UUID userId);

    void deleteByExpiresAtBefore(Instant timestamp);
}
