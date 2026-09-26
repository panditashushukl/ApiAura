package com.apiaura.apiaura.api.request.repository;

import com.apiaura.apiaura.api.request.entity.ApiRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface ApiRequestRepository
        extends JpaRepository<ApiRequest, UUID> {

    Page<ApiRequest> findByCollectionId(
            UUID collectionId,
            Pageable pageable
    );

    Page<ApiRequest> findByCollectionIdAndFolderId(
            UUID collectionId,
            UUID folderId,
            Pageable pageable
    );

    boolean existsByCollectionIdAndNameIgnoreCase(
            UUID collectionId,
            String name
    );

    @Query("""
            SELECT r
            FROM ApiRequest r
            JOIN FETCH r.collection c
            JOIN FETCH c.workspace w
            JOIN FETCH r.createdBy u
            LEFT JOIN FETCH r.folder f
            LEFT JOIN FETCH r.parentRequest p
            WHERE r.id = :id
            """)
    Optional<ApiRequest> findDetailedById(
            @Param("id") UUID id
    );
}
