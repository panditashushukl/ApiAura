package com.apiaura.apiaura.org.workspace.service;

import com.apiaura.apiaura.org.workspace.dto.request.CreateWorkspaceRequest;
import com.apiaura.apiaura.org.workspace.dto.request.UpdateWorkspaceRequest;
import com.apiaura.apiaura.org.workspace.dto.response.WorkspaceResponse;

import java.util.List;
import java.util.UUID;

public interface WorkspaceService {

    WorkspaceResponse create(
            UUID organizationId,
            UUID createdBy,
            CreateWorkspaceRequest request
    );

    WorkspaceResponse getById(UUID workspaceId);

    List<WorkspaceResponse> getByOrganization(
            UUID organizationId
    );

    List<WorkspaceResponse> getByUser(UUID userId);

    WorkspaceResponse update(
            UUID workspaceId,
            UpdateWorkspaceRequest request
    );

    void delete(UUID workspaceId);
}
