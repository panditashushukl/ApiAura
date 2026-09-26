package com.apiaura.apiaura.api.environment.service;

import com.apiaura.apiaura.api.environment.dto.request.CreateEnvironmentRequest;
import com.apiaura.apiaura.api.environment.dto.request.UpdateEnvironmentRequest;
import com.apiaura.apiaura.api.environment.dto.response.EnvironmentResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface EnvironmentService {

    EnvironmentResponse create(
            UUID workspaceId,
            UUID userId,
            CreateEnvironmentRequest request
    );

    EnvironmentResponse getById(
            UUID environmentId,
            UUID userId
    );

    Page<EnvironmentResponse> getByWorkspace(
            UUID workspaceId,
            UUID userId,
            Pageable pageable
    );

    EnvironmentResponse update(
            UUID environmentId,
            UUID userId,
            UpdateEnvironmentRequest request
    );

    EnvironmentResponse activate(
            UUID environmentId,
            UUID userId
    );

    EnvironmentResponse deactivate(
            UUID environmentId,
            UUID userId
    );

    void delete(
            UUID environmentId,
            UUID userId
    );
}
