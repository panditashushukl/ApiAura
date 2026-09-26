package com.apiaura.apiaura.api.collection.service;

import com.apiaura.apiaura.api.collection.dto.request.CreateCollectionRequest;
import com.apiaura.apiaura.api.collection.dto.request.UpdateCollectionRequest;
import com.apiaura.apiaura.api.collection.dto.response.CollectionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface CollectionService {

    CollectionResponse create(
            UUID workspaceId,
            UUID userId,
            CreateCollectionRequest request
    );

    CollectionResponse getById(
            UUID collectionId,
            UUID userId
    );

    Page<CollectionResponse> getByWorkspace(
            UUID workspaceId,
            UUID userId,
            Pageable pageable
    );

    CollectionResponse update(
            UUID collectionId,
            UUID userId,
            UpdateCollectionRequest request
    );

    void delete(
            UUID collectionId,
            UUID userId
    );
}
