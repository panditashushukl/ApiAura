package com.apiaura.apiaura.api.request.service;

import com.apiaura.apiaura.api.request.dto.request.CreateApiRequest;
import com.apiaura.apiaura.api.request.dto.request.UpdateApiRequest;
import com.apiaura.apiaura.api.request.dto.response.ApiRequestResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ApiRequestService {

    ApiRequestResponse create(
            UUID collectionId,
            UUID userId,
            CreateApiRequest request
    );

    ApiRequestResponse getById(
            UUID requestId,
            UUID userId
    );

    Page<ApiRequestResponse> getByCollection(
            UUID collectionId,
            UUID userId,
            Pageable pageable
    );

    Page<ApiRequestResponse> getByFolder(
            UUID collectionId,
            UUID folderId,
            UUID userId,
            Pageable pageable
    );

    ApiRequestResponse update(
            UUID requestId,
            UUID userId,
            UpdateApiRequest request
    );

    void delete(
            UUID requestId,
            UUID userId
    );
}
