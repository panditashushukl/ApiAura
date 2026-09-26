package com.apiaura.apiaura.api.environment.repository;

import com.apiaura.apiaura.api.environment.entity.EnvironmentVariable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EnvironmentVariableRepository
        extends JpaRepository<EnvironmentVariable, UUID> {

    List<EnvironmentVariable> findByEnvironmentIdOrderByVariableKeyAsc(
            UUID environmentId
    );

    Optional<EnvironmentVariable> findByIdAndEnvironmentId(
            UUID id,
            UUID environmentId
    );

    Optional<EnvironmentVariable> findByEnvironmentIdAndVariableKey(
            UUID environmentId,
            String variableKey
    );

    boolean existsByEnvironmentIdAndVariableKey(
            UUID environmentId,
            String variableKey
    );

    long countByEnvironmentId(UUID environmentId);

    void deleteByEnvironmentId(UUID environmentId);
}
