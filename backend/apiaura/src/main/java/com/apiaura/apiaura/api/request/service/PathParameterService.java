package com.apiaura.apiaura.api.request.service;

import com.apiaura.apiaura.api.request.dto.request.CreatePathParameterRequest;
import com.apiaura.apiaura.api.request.dto.request.UpdatePathParameterRequest;
import com.apiaura.apiaura.api.request.dto.response.PathParameterResponse;

import java.util.List;
import java.util.UUID;

public interface PathParameterService {

    List<PathParameterResponse> getByRequest(
            UUID requestId,
            UUID userId
    );

    PathParameterResponse getById(
            UUID requestId,
            UUID parameterId,
            UUID userId
    );

    PathParameterResponse create(
            UUID requestId,
            UUID userId,
            CreatePathParameterRequest request
    );

    PathParameterResponse update(
            UUID requestId,
            UUID parameterId,
            UUID userId,
            UpdatePathParameterRequest request
    );

    void delete(
            UUID requestId,
            UUID parameterId,
            UUID userId
    );
}
