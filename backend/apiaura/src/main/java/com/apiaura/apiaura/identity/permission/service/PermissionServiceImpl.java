package com.apiaura.apiaura.identity.permission.service;

import com.apiaura.apiaura.foundation.common.exception.BadRequestException;
import com.apiaura.apiaura.foundation.common.exception.ResourceNotFoundException;
import com.apiaura.apiaura.identity.permission.dto.request.CreatePermissionRequest;
import com.apiaura.apiaura.identity.permission.dto.response.PermissionResponse;
import com.apiaura.apiaura.identity.permission.entity.Permission;
import com.apiaura.apiaura.identity.permission.repository.PermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PermissionServiceImpl implements PermissionService {

    private final PermissionRepository permissionRepository;

    @Override
    @Transactional
    public PermissionResponse create(
            CreatePermissionRequest request
    ) {

        if (permissionRepository.existsByCode(request.getCode())) {
            throw new BadRequestException(
                    "Permission code already exists"
            );
        }

        Permission permission = new Permission();

        permission.setName(request.getName());
        permission.setCode(request.getCode());
        permission.setResource(request.getResource());
        permission.setAction(request.getAction());
        permission.setDescription(request.getDescription());

        return PermissionResponse.from(
                permissionRepository.save(permission)
        );
    }

    @Override
    public PermissionResponse getById(UUID permissionId) {

        Permission permission = permissionRepository.findById(
                permissionId
        ).orElseThrow(() ->
                new ResourceNotFoundException(
                        "Permission not found: " + permissionId
                )
        );

        return PermissionResponse.from(permission);
    }

    @Override
    public List<PermissionResponse> getAll() {
        return permissionRepository.findAll()
                .stream()
                .map(PermissionResponse::from)
                .toList();
    }

    @Override
    public List<PermissionResponse> getByResource(
            String resource
    ) {
        return permissionRepository
                .findByResource(resource)
                .stream()
                .map(PermissionResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public void delete(UUID permissionId) {

        Permission permission = permissionRepository.findById(
                permissionId
        ).orElseThrow(() ->
                new ResourceNotFoundException(
                        "Permission not found: " + permissionId
                )
        );

        permissionRepository.delete(permission);
    }
}
