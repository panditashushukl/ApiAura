package com.apiaura.apiaura.api.collection.repository;

import com.apiaura.apiaura.api.collection.entity.Collection;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface CollectionRepository extends JpaRepository<Collection, UUID> {

    Page<Collection> findByWorkspaceId(
            UUID workspaceId,
            Pageable pageable
    );

    Optional<Collection> findByIdAndWorkspaceId(
            UUID id,
            UUID workspaceId
    );

    boolean existsByWorkspaceIdAndNameIgnoreCase(
            UUID workspaceId,
            String name
    );

    @Query("""
            SELECT c
            FROM Collection c
            JOIN FETCH c.workspace w
            JOIN FETCH c.createdBy u
            WHERE c.id = :id
            """)
    Optional<Collection> findDetailedById(
            @Param("id") UUID id
    );
}
