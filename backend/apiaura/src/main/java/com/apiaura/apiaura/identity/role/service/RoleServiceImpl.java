package com.apiaura.apiaura.identity.role.service;

import com.apiaura.apiaura.foundation.common.exception.BadRequestException;
import com.apiaura.apiaura.foundation.common.exception.ResourceNotFoundException;
import com.apiaura.apiaura.identity.role.dto.request.CreateRoleRequest;
import com.apiaura.apiaura.identity.role.dto.request.UpdateRoleRequest;
import com.apiaura.apiaura.identity.role.dto.response.RoleResponse;
import com.apiaura.apiaura.identity.role.entity.Role;
import com.apiaura.apiaura.identity.role.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;

    @Override
    @Transactional
    public RoleResponse create(CreateRoleRequest request) {

        if (roleRepository.existsByCode(request.getCode())) {
            throw new BadRequestException(
                    "Role code already exists"
            );
        }

        Role role = new Role();

        role.setName(request.getName());
        role.setCode(request.getCode());
        role.setDescription(request.getDescription());
        role.setSystemRole(request.isSystemRole());

        return RoleResponse.from(
                roleRepository.save(role)
        );
    }

    @Override
    public RoleResponse getById(UUID roleId) {
        return RoleResponse.from(findRole(roleId));
    }

    @Override
    public List<RoleResponse> getAll() {
        return roleRepository.findAll()
                .stream()
                .map(RoleResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public RoleResponse update(
            UUID roleId,
            UpdateRoleRequest request
    ) {
        Role role = findRole(roleId);

        if (role.isSystemRole()) {
            throw new BadRequestException(
                    "System roles cannot be modified"
            );
        }

        if (request.getName() != null) {
            role.setName(request.getName());
        }

        if (request.getDescription() != null) {
            role.setDescription(request.getDescription());
        }

        return RoleResponse.from(
                roleRepository.save(role)
        );
    }

    @Override
    @Transactional
    public void delete(UUID roleId) {

        Role role = findRole(roleId);

        if (role.isSystemRole()) {
            throw new BadRequestException(
                    "System roles cannot be deleted"
            );
        }

        roleRepository.delete(role);
    }

    private Role findRole(UUID roleId) {
        return roleRepository.findById(roleId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Role not found: " + roleId
                        )
                );
    }
}
