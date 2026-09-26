package com.apiaura.apiaura.api.request.service;

import com.apiaura.apiaura.api.request.dto.request.CreateQueryParameterRequest;
import com.apiaura.apiaura.api.request.dto.request.UpdateQueryParameterRequest;
import com.apiaura.apiaura.api.request.dto.response.QueryParameterResponse;

import java.util.List;
import java.util.UUID;

public interface QueryParameterService {

    List<QueryParameterResponse> getByRequest(
            UUID requestId,
            UUID userId
    );

    QueryParameterResponse getById(
            UUID requestId,
            UUID parameterId,
            UUID userId
    );

    QueryParameterResponse create(
            UUID requestId,
            UUID userId,
            CreateQueryParameterRequest request
    );

    QueryParameterResponse update(
            UUID requestId,
            UUID parameterId,
            UUID userId,
            UpdateQueryParameterRequest request
    );

    void delete(
            UUID requestId,
            UUID parameterId,
            UUID userId
    );
}
