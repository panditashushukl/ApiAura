package com.apiaura.apiaura.identity.user.repository;

import com.apiaura.apiaura.identity.user.entity.User;
import com.apiaura.apiaura.foundation.common.enums.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByEmailAndStatus(
            String email,
            UserStatus status
    );

    long countByStatus(UserStatus status);
}
