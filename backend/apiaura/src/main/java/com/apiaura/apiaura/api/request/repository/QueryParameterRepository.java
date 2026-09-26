package com.apiaura.apiaura.api.request.repository;

import com.apiaura.apiaura.api.request.entity.QueryParameter;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface QueryParameterRepository
        extends JpaRepository<QueryParameter, UUID> {

    List<QueryParameter> findByRequestIdOrderBySortOrderAsc(
            UUID requestId
    );

    Optional<QueryParameter> findByIdAndRequestId(
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
