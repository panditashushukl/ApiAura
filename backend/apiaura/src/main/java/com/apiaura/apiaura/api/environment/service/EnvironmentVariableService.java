package com.apiaura.apiaura.api.environment.service;

import com.apiaura.apiaura.api.environment.dto.request.CreateEnvironmentVariableRequest;
import com.apiaura.apiaura.api.environment.dto.request.UpdateEnvironmentVariableRequest;
import com.apiaura.apiaura.api.environment.dto.response.EnvironmentVariableResponse;

import java.util.List;
import java.util.UUID;

public interface EnvironmentVariableService {

    List<EnvironmentVariableResponse> getByEnvironment(
            UUID environmentId,
            UUID userId
    );

    EnvironmentVariableResponse getById(
            UUID environmentId,
            UUID variableId,
            UUID userId
    );

    EnvironmentVariableResponse create(
            UUID environmentId,
            UUID userId,
            CreateEnvironmentVariableRequest request
    );

    EnvironmentVariableResponse update(
            UUID environmentId,
            UUID variableId,
            UUID userId,
            UpdateEnvironmentVariableRequest request
    );

    void delete(
            UUID environmentId,
            UUID variableId,
            UUID userId
    );
}
