package com.apiaura.apiaura.identity.role.repository;

import com.apiaura.apiaura.identity.role.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRoleRepository extends JpaRepository<UserRole, UUID> {

    List<UserRole> findByUserId(UUID userId);

    List<UserRole> findByRoleId(UUID roleId);

    Optional<UserRole> findByUserIdAndRoleId(
            UUID userId,
            UUID roleId
    );

    boolean existsByUserIdAndRoleId(
            UUID userId,
            UUID roleId
    );

    void deleteByUserIdAndRoleId(
            UUID userId,
            UUID roleId
    );
}
