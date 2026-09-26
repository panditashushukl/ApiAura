package com.apiaura.apiaura.api.request.repository;

import com.apiaura.apiaura.api.request.entity.PathParameter;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PathParameterRepository
        extends JpaRepository<PathParameter, UUID> {

    List<PathParameter> findByRequestIdOrderBySortOrderAsc(
            UUID requestId
    );

    Optional<PathParameter> findByIdAndRequestId(
            UUID id,
            UUID requestId
    );

    boolean existsByRequestIdAndParamKeyIgnoreCase(
            UUID requestId,
            String paramKey
    );

    long countByRequestId(UUID requestId);

    void deleteByRequestId(UUID requestId);
}
