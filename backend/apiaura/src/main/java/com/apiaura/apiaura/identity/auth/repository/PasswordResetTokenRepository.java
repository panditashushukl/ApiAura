package com.apiaura.apiaura.identity.auth.repository;

import com.apiaura.apiaura.identity.auth.entity.PasswordResetToken;
import com.apiaura.apiaura.identity.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {

    Optional<PasswordResetToken> findByTokenHash(String tokenHash);

    List<PasswordResetToken> findAllByUserAndUsedAtIsNull(User user);
}

