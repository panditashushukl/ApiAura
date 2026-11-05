package com.apiaura.apiaura.identity.user.service;

import com.apiaura.apiaura.foundation.common.enums.UserStatus;
import com.apiaura.apiaura.foundation.common.exception.BadRequestException;
import com.apiaura.apiaura.foundation.common.exception.ResourceNotFoundException;
import com.apiaura.apiaura.foundation.common.security.SecurityUtils;
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

        UUID orgId = request.getOrganizationId();
        if (orgId == null) {
            try {
                UUID currentUserId = SecurityUtils.getCurrentUserId();
                User currentUser = findUser(currentUserId);
                if (currentUser.getOrganization() != null) {
                    orgId = currentUser.getOrganization().getId();
                }
            } catch (Exception ignored) {}
        }

        if (orgId != null) {
            organizationRepository.findById(orgId).ifPresent(user::setOrganization);
        }

        user = userRepository.save(user);

        if (request.getRoleId() != null) {
            final User savedUser = user;
            roleRepository.findById(request.getRoleId()).ifPresent(role -> {
                UserRole ur = new UserRole();
                ur.setUser(savedUser);
                ur.setRole(role);
                ur.setAssignedAt(Instant.now());
                userRoleRepository.save(ur);
                savedUser.getRoles().add(ur);
            });
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
            UUID currentUserId = com.apiaura.apiaura.foundation.common.security.SecurityUtils.getCurrentUserId();
            User currentUser = findUser(currentUserId);

            boolean isSuperAdmin = currentUser.getRoles().stream()
                    .anyMatch(ur -> ur.getRole() != null && "SUPER_ADMIN".equalsIgnoreCase(ur.getRole().getCode()));

            if (isSuperAdmin) {
                return userRepository.findAll()
                        .stream()
                        .map(UserResponse::from)
                        .toList();
            }

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
        } else if (request.getOrganizationId() != null) {
            try {
                UUID currentUserId = com.apiaura.apiaura.foundation.common.security.SecurityUtils.getCurrentUserId();
                User currentUser = findUser(currentUserId);
                boolean isSuperAdmin = currentUser.getRoles().stream()
                        .anyMatch(ur -> ur.getRole() != null && "SUPER_ADMIN".equalsIgnoreCase(ur.getRole().getCode()));

                com.apiaura.apiaura.org.organization.entity.Organization targetOrg = organizationRepository.findById(request.getOrganizationId())
                        .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

                if (!isSuperAdmin) {
                    if (currentUser.getOrganization() == null || !currentUser.getOrganization().getId().equals(targetOrg.getId())) {
                        throw new BadRequestException("Org admins can only assign users to their own organization");
                    }
                }
                user.setOrganization(targetOrg);
            } catch (Exception e) {
                if (e instanceof BadRequestException || e instanceof ResourceNotFoundException) {
                    throw e;
                }
                // Fallback for direct service updates
                organizationRepository.findById(request.getOrganizationId()).ifPresent(user::setOrganization);
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
        User adminUser = findUser(adminUserId);
        User targetUser = findUser(targetUserId);

        boolean isSuperAdmin = adminUser.getRoles().stream()
                .anyMatch(ur -> ur.getRole() != null && "SUPER_ADMIN".equalsIgnoreCase(ur.getRole().getCode()));

        if (!isSuperAdmin) {
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
