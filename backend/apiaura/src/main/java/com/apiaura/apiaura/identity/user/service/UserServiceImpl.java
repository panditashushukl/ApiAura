package com.apiaura.apiaura.identity.user.service;

import com.apiaura.apiaura.foundation.common.enums.UserStatus;
import com.apiaura.apiaura.foundation.common.exception.BadRequestException;
import com.apiaura.apiaura.foundation.common.exception.ResourceNotFoundException;
import com.apiaura.apiaura.foundation.common.security.SecurityUtils;
import com.apiaura.apiaura.identity.role.entity.Role;
import com.apiaura.apiaura.identity.role.entity.UserRole;
import com.apiaura.apiaura.identity.role.repository.RoleRepository;
import com.apiaura.apiaura.identity.role.repository.UserRoleRepository;
import com.apiaura.apiaura.identity.user.dto.request.CreateUserRequest;
import com.apiaura.apiaura.identity.user.dto.request.UpdateUserRequest;
import com.apiaura.apiaura.identity.user.dto.response.UserResponse;
import com.apiaura.apiaura.identity.user.entity.User;
import com.apiaura.apiaura.identity.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final com.apiaura.apiaura.org.organization.repository.OrganizationRepository organizationRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;

    @Override
    @Transactional
    public UserResponse create(CreateUserRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email is already registered");
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setMobileNumber(request.getMobileNumber());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setStatus(UserStatus.ACTIVE);

        List<UUID> requestedOrgIds = request.getOrganizationIds();
        if ((requestedOrgIds == null || requestedOrgIds.isEmpty()) && request.getOrganizationId() != null) {
            requestedOrgIds = List.of(request.getOrganizationId());
        }

        if (requestedOrgIds == null || requestedOrgIds.isEmpty()) {
            try {
                UUID currentUserId = SecurityUtils.getCurrentUserId();
                User currentUser = findUser(currentUserId);
                if (currentUser.getOrganization() != null) {
                    requestedOrgIds = List.of(currentUser.getOrganization().getId());
                }
            } catch (Exception ignored) {}
        }

        boolean isSuperAdmin = SecurityUtils.isSuperAdmin();

        if (requestedOrgIds != null && !requestedOrgIds.isEmpty()) {
            if (!isSuperAdmin) {
                try {
                    UUID currentUserId = SecurityUtils.getCurrentUserId();
                    User currentUser = findUser(currentUserId);
                    UUID currentOrgId = currentUser.getOrganization() != null ? currentUser.getOrganization().getId() : null;
                    for (UUID oId : requestedOrgIds) {
                        if (currentOrgId == null || !currentOrgId.equals(oId)) {
                            throw new BadRequestException("Org admins can only assign users to their own organization");
                        }
                    }
                } catch (BadRequestException e) {
                    throw e;
                } catch (Exception ignored) {}
            }

            for (UUID oId : requestedOrgIds) {
                var orgOpt = organizationRepository.findById(oId);
                if (orgOpt.isPresent()) {
                    var org = orgOpt.get();
                    user.getOrganizations().add(org);
                    if (user.getOrganization() == null) {
                        user.setOrganization(org);
                    }
                }
            }
        }

        user = userRepository.save(user);

        List<UUID> requestedRoleIds = request.getRoleIds();
        if ((requestedRoleIds == null || requestedRoleIds.isEmpty()) && request.getRoleId() != null) {
            requestedRoleIds = List.of(request.getRoleId());
        }

        if (requestedRoleIds != null && !requestedRoleIds.isEmpty()) {
            final User savedUser = user;
            for (UUID rId : requestedRoleIds) {
                Role role = roleRepository.findById(rId)
                        .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + rId));
                if ("SUPER_ADMIN".equalsIgnoreCase(role.getCode()) && !isSuperAdmin) {
                    throw new BadRequestException("Only Super Administrator can assign SUPER_ADMIN role");
                }
                UserRole ur = new UserRole();
                ur.setUser(savedUser);
                ur.setRole(role);
                ur.setAssignedAt(Instant.now());
                userRoleRepository.save(ur);
                savedUser.getRoles().add(ur);
            }
        } else {
            final User savedUser = user;
            roleRepository.findByCode("GUEST").ifPresent(role -> {
                UserRole ur = new UserRole();
                ur.setUser(savedUser);
                ur.setRole(role);
                ur.setAssignedAt(Instant.now());
                userRoleRepository.save(ur);
                savedUser.getRoles().add(ur);
            });
        }

        return UserResponse.from(user);
    }

    @Override
    public UserResponse getById(UUID userId) {
        return UserResponse.from(findUser(userId));
    }

    @Override
    public UserResponse getByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found")
                );

        return UserResponse.from(user);
    }

    @Override
    public List<UserResponse> getAll() {
        try {
            if (SecurityUtils.isSuperAdmin()) {
                return userRepository.findAll()
                        .stream()
                        .map(UserResponse::from)
                        .toList();
            }

            UUID currentUserId = SecurityUtils.getCurrentUserId();
            User currentUser = findUser(currentUserId);

            if (currentUser.getOrganization() != null) {
                return userRepository.findByOrganizationId(currentUser.getOrganization().getId())
                        .stream()
                        .map(UserResponse::from)
                        .toList();
            }
        } catch (Exception ignored) {
            // Fallback for system internal calls
        }

        return userRepository.findAll()
                .stream()
                .map(UserResponse::from)
                .toList();
    }

    @Override
    public List<UserResponse> getByOrganizationId(UUID organizationId) {
        var org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found: " + organizationId));

        if (!SecurityUtils.isSuperAdmin()) {
            UUID currentUserId = SecurityUtils.getCurrentUserId();
            User currentUser = findUser(currentUserId);

            boolean isOwner = org.getOwner() != null && org.getOwner().getId().equals(currentUserId);
            boolean belongsToOrg = currentUser.getOrganization() != null &&
                    currentUser.getOrganization().getId().equals(organizationId);

            if (!isOwner && !belongsToOrg) {
                throw new org.springframework.security.access.AccessDeniedException(
                        "You do not have permission to view members of this organization"
                );
            }
        }

        List<User> users = userRepository.findByOrganizationId(organizationId);

        // Ensure owner is included in the list even if their active organization pointer was switched
        if (org.getOwner() != null && users.stream().noneMatch(u -> u.getId().equals(org.getOwner().getId()))) {
            users = new java.util.ArrayList<>(users);
            users.add(0, org.getOwner());
        }

        return users.stream()
                .map(UserResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public UserResponse update(
            UUID userId,
            UpdateUserRequest request
    ) {
        User user = findUser(userId);

        if (request.getEmail() != null &&
                !request.getEmail().equalsIgnoreCase(user.getEmail()) &&
                userRepository.existsByEmail(request.getEmail())) {

            throw new BadRequestException(
                    "Email is already registered"
            );
        }

        if (request.getName() != null) {
            user.setName(request.getName());
        }

        if (request.getEmail() != null) {
            user.setEmail(request.getEmail().toLowerCase());
        }

        if (request.getMobileNumber() != null) {
            user.setMobileNumber(request.getMobileNumber());
        }

        if (Boolean.TRUE.equals(request.getClearOrganization())) {
            user.setOrganization(null);
            user.getOrganizations().clear();
        } else if (request.getOrganizationIds() != null) {
            boolean isSuperAdmin = SecurityUtils.isSuperAdmin();
            if (!isSuperAdmin) {
                try {
                    UUID currentUserId = SecurityUtils.getCurrentUserId();
                    User currentUser = findUser(currentUserId);
                    UUID currentOrgId = currentUser.getOrganization() != null ? currentUser.getOrganization().getId() : null;
                    for (UUID oId : request.getOrganizationIds()) {
                        if (currentOrgId == null || !currentOrgId.equals(oId)) {
                            throw new BadRequestException("Org admins can only assign users to their own organization");
                        }
                    }
                } catch (BadRequestException e) {
                    throw e;
                } catch (Exception ignored) {}
            }

            user.getOrganizations().clear();
            for (UUID oId : request.getOrganizationIds()) {
                organizationRepository.findById(oId).ifPresent(org -> {
                    user.getOrganizations().add(org);
                });
            }
            if (!user.getOrganizations().isEmpty()) {
                if (user.getOrganization() == null || !user.getOrganizations().contains(user.getOrganization())) {
                    user.setOrganization(user.getOrganizations().iterator().next());
                }
            } else {
                user.setOrganization(null);
            }
        } else if (request.getOrganizationId() != null) {
            try {
                com.apiaura.apiaura.org.organization.entity.Organization targetOrg = organizationRepository.findById(request.getOrganizationId())
                        .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

                boolean isSuperAdmin = SecurityUtils.isSuperAdmin();

                if (!isSuperAdmin) {
                    UUID currentUserId = SecurityUtils.getCurrentUserId();
                    User currentUser = findUser(currentUserId);
                    boolean isSelf = currentUserId != null && currentUserId.equals(userId);
                    boolean isTargetOwner = targetOrg.getOwner() != null && targetOrg.getOwner().getId().equals(currentUserId);
                    boolean isSameOrg = currentUser.getOrganization() != null && currentUser.getOrganization().getId().equals(targetOrg.getId());

                    if (!isSelf && !isTargetOwner && !isSameOrg) {
                        throw new BadRequestException("Org admins can only assign users to their own organization");
                    }
                }
                user.setOrganization(targetOrg);
                user.getOrganizations().add(targetOrg);
            } catch (Exception e) {
                if (e instanceof BadRequestException || e instanceof ResourceNotFoundException) {
                    throw e;
                }
                // Fallback for direct service updates
                organizationRepository.findById(request.getOrganizationId()).ifPresent(org -> {
                    user.setOrganization(org);
                    user.getOrganizations().add(org);
                });
            }
        }

        if (request.getRoleIds() != null) {
            boolean isSuperAdmin = SecurityUtils.isSuperAdmin();
            if (!isSuperAdmin) {
                try {
                    UUID currentUserId = SecurityUtils.getCurrentUserId();
                    User currentUser = findUser(currentUserId);
                    boolean isSameOrg = currentUser.getOrganization() != null &&
                            user.getOrganization() != null &&
                            currentUser.getOrganization().getId().equals(user.getOrganization().getId());
                    boolean isOwner = user.getOrganization() != null &&
                            user.getOrganization().getOwner() != null &&
                            user.getOrganization().getOwner().getId().equals(currentUserId);
                    if (!isSameOrg && !isOwner) {
                        throw new BadRequestException("Org admins can only manage roles for users in their own organization");
                    }
                } catch (BadRequestException e) {
                    throw e;
                } catch (Exception ignored) {}
            }

            List<UserRole> currentRoles = userRoleRepository.findByUserId(userId);
            for (UserRole ur : currentRoles) {
                if (!request.getRoleIds().contains(ur.getRole().getId())) {
                    if ("SUPER_ADMIN".equalsIgnoreCase(ur.getRole().getCode()) && !isSuperAdmin) {
                        throw new BadRequestException("Only Super Administrator can remove SUPER_ADMIN role");
                    }
                    userRoleRepository.delete(ur);
                    user.getRoles().remove(ur);
                }
            }

            for (UUID rId : request.getRoleIds()) {
                if (currentRoles.stream().noneMatch(ur -> ur.getRole().getId().equals(rId))) {
                    Role role = roleRepository.findById(rId)
                            .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + rId));
                    if ("SUPER_ADMIN".equalsIgnoreCase(role.getCode()) && !isSuperAdmin) {
                        throw new BadRequestException("Only Super Administrator can assign SUPER_ADMIN role");
                    }
                    UserRole userRole = new UserRole();
                    userRole.setUser(user);
                    userRole.setRole(role);
                    userRole.setAssignedAt(java.time.Instant.now());
                    userRoleRepository.save(userRole);
                    user.getRoles().add(userRole);
                }
            }
        }

        return UserResponse.from(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponse updateStatus(
            UUID userId,
            UserStatus status
    ) {
        User user = findUser(userId);

        user.setStatus(status);

        return UserResponse.from(userRepository.save(user));
    }

    @Override
    @Transactional
    public void delete(UUID userId) {
        User user = findUser(userId);
        userRepository.delete(user);
    }

    @Override
    @Transactional
    public void changePassword(UUID userId, String currentPassword, String newPassword) {
        User user = findUser(userId);

        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void resetPasswordByAdmin(UUID adminUserId, UUID targetUserId, String newPassword) {
        User targetUser = findUser(targetUserId);

        boolean isSuperAdmin = SecurityUtils.isSuperAdmin();
        if (!isSuperAdmin) {
            User adminUser = findUser(adminUserId);
            // Verify target user belongs to same organization as admin
            if (adminUser.getOrganization() == null || targetUser.getOrganization() == null ||
                    !adminUser.getOrganization().getId().equals(targetUser.getOrganization().getId())) {
                throw new BadRequestException("You can only reset passwords for users in your organization");
            }
        }

        targetUser.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(targetUser);
    }

    private User findUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found: " + userId
                        )
                );
    }
}
