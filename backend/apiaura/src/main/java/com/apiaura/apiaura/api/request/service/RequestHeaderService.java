package com.apiaura.apiaura.api.request.service;

import com.apiaura.apiaura.api.request.dto.request.CreateRequestHeaderRequest;
import com.apiaura.apiaura.api.request.dto.request.UpdateRequestHeaderRequest;
import com.apiaura.apiaura.api.request.dto.response.RequestHeaderResponse;

import java.util.List;
import java.util.UUID;

public interface RequestHeaderService {

    List<RequestHeaderResponse> getByRequest(
            UUID requestId,
            UUID userId
    );

    RequestHeaderResponse getById(
            UUID requestId,
            UUID headerId,
            UUID userId
    );

    RequestHeaderResponse create(
            UUID requestId,
            UUID userId,
            CreateRequestHeaderRequest request
    );

    RequestHeaderResponse update(
            UUID requestId,
            UUID headerId,
            UUID userId,
            UpdateRequestHeaderRequest request
    );

    void delete(
            UUID requestId,
            UUID headerId,
            UUID userId
    );
}
