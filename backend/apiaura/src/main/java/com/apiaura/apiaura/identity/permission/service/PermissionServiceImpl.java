package com.apiaura.apiaura.identity.permission.service;

import com.apiaura.apiaura.foundation.common.exception.ResourceNotFoundException;
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

    private boolean isWildcard(Permission permission) {
        if (permission == null) {
            return false;
        }
        return "*".equals(permission.getCode())
                || "*".equals(permission.getResource())
                || "*".equals(permission.getAction());
    }

    @Override
    public PermissionResponse getById(UUID permissionId) {
        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Permission not found: " + permissionId));
        if (isWildcard(permission)) {
            throw new ResourceNotFoundException("Permission not found: " + permissionId);
        }
        return PermissionResponse.from(permission);
    }

    @Override
    public List<PermissionResponse> getAll() {
        return permissionRepository.findAll()
                .stream()
                .filter(p -> !isWildcard(p))
                .map(PermissionResponse::from)
                .toList();
    }

    @Override
    public List<PermissionResponse> getByResource(String resource) {
        return permissionRepository.findByResource(resource)
                .stream()
                .filter(p -> !isWildcard(p))
                .map(PermissionResponse::from)
                .toList();
    }
}
