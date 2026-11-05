package com.apiaura.apiaura.identity.permission.service;

import com.apiaura.apiaura.identity.permission.dto.response.PermissionResponse;

import java.util.List;
import java.util.UUID;

public interface PermissionService {

    PermissionResponse getById(UUID permissionId);

    List<PermissionResponse> getAll();

    List<PermissionResponse> getByResource(
            String resource
    );
}
