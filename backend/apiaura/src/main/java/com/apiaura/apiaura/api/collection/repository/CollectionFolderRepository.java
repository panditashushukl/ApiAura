package com.apiaura.apiaura.api.collection.repository;

import com.apiaura.apiaura.api.collection.entity.CollectionFolder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CollectionFolderRepository
        extends JpaRepository<CollectionFolder, UUID> {

    List<CollectionFolder> findByCollectionIdOrderBySortOrderAsc(
            UUID collectionId
    );

    List<CollectionFolder> findByCollectionIdAndParentFolderIdOrderBySortOrderAsc(
            UUID collectionId,
            UUID parentFolderId
    );

    List<CollectionFolder> findByCollectionIdAndParentFolderIsNullOrderBySortOrderAsc(
            UUID collectionId
    );

    Optional<CollectionFolder> findByIdAndCollectionId(
            UUID id,
            UUID collectionId
    );

    boolean existsByCollectionIdAndNameIgnoreCase(
            UUID collectionId,
            String name
    );

    boolean existsByCollectionIdAndParentFolderIdAndNameIgnoreCase(
            UUID collectionId,
            UUID parentFolderId,
            String name
    );

    long countByCollectionId(UUID collectionId);

    long countByParentFolderId(UUID parentFolderId);
}