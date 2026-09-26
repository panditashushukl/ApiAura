package com.apiaura.apiaura.api.request.repository;

import com.apiaura.apiaura.api.request.entity.RequestHeader;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RequestHeaderRepository
        extends JpaRepository<RequestHeader, UUID> {

    List<RequestHeader> findByRequestIdOrderBySortOrderAsc(UUID requestId);

    Optional<RequestHeader> findByIdAndRequestId(
            UUID id,
            UUID requestId
    );

    boolean existsByRequestIdAndHeaderKeyIgnoreCase(
            UUID requestId,
            String headerKey
    );

    long countByRequestId(UUID requestId);

    void deleteByRequestId(UUID requestId);
}
