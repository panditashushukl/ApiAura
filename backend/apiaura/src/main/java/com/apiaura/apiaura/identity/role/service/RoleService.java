package com.apiaura.apiaura.identity.role.service;

import com.apiaura.apiaura.identity.role.dto.request.CreateRoleRequest;
import com.apiaura.apiaura.identity.role.dto.request.UpdateRoleRequest;
import com.apiaura.apiaura.identity.role.dto.response.RoleResponse;

import java.util.List;
import java.util.UUID;

public interface RoleService {

    RoleResponse create(CreateRoleRequest request);

    RoleResponse getById(UUID roleId);

    List<RoleResponse> getAll();

    RoleResponse update(
            UUID roleId,
            UpdateRoleRequest request
    );

    void delete(UUID roleId);
}
