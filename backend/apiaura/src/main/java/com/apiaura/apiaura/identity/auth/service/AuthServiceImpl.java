package com.apiaura.apiaura.identity.auth.service;

import com.apiaura.apiaura.identity.auth.dto.request.LoginRequest;
import com.apiaura.apiaura.identity.auth.dto.request.RefreshTokenRequest;
import com.apiaura.apiaura.identity.auth.dto.request.RegisterRequest;
import com.apiaura.apiaura.identity.auth.dto.response.AuthResponse;
import com.apiaura.apiaura.identity.auth.entity.RefreshToken;
import com.apiaura.apiaura.identity.auth.repository.RefreshTokenRepository;
import com.apiaura.apiaura.foundation.common.config.JwtProperties;
import com.apiaura.apiaura.foundation.common.enums.UserStatus;
import com.apiaura.apiaura.foundation.common.exception.BadRequestException;
import com.apiaura.apiaura.foundation.common.exception.UnauthorizedException;
import com.apiaura.apiaura.foundation.common.security.JwtService;
import com.apiaura.apiaura.identity.user.dto.response.UserResponse;
import com.apiaura.apiaura.identity.user.entity.User;
import com.apiaura.apiaura.identity.user.repository.UserRepository;
import org.springframework.security.core.AuthenticationException;

import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

import lombok.extern.slf4j.Slf4j;
import com.apiaura.apiaura.org.workspace.repository.WorkspaceRepository;
import com.apiaura.apiaura.org.workspace.repository.WorkspaceMemberRepository;
import com.apiaura.apiaura.api.collection.repository.CollectionRepository;
import com.apiaura.apiaura.api.request.repository.ApiRequestRepository;
import com.apiaura.apiaura.org.workspace.entity.Workspace;
import com.apiaura.apiaura.org.workspace.entity.WorkspaceMember;
import com.apiaura.apiaura.api.collection.entity.Collection;
import com.apiaura.apiaura.api.request.entity.ApiRequest;
import com.apiaura.apiaura.foundation.common.enums.WorkspaceStatus;
import com.apiaura.apiaura.foundation.common.enums.HttpMethod;
import com.apiaura.apiaura.foundation.common.enums.BodyType;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final com.apiaura.apiaura.identity.role.repository.RoleRepository roleRepository;
    private final com.apiaura.apiaura.identity.role.repository.UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;
    private final com.apiaura.apiaura.org.organization.repository.OrganizationRepository organizationRepository;
    private final com.apiaura.apiaura.org.organization.repository.OrganizationMembershipRequestRepository membershipRequestRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final CollectionRepository collectionRepository;
    private final ApiRequestRepository apiRequestRepository;

    @Override
    @Transactional
    public AuthResponse register(@NonNull RegisterRequest request) {

        String email = request.getEmail()
                .trim()
                .toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException(
                    "Email is already registered"
            );
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(email);
        user.setMobileNumber(request.getMobileNumber());
        user.setPasswordHash(
                passwordEncoder.encode(request.getPassword())
        );

        user.setStatus(UserStatus.ACTIVE);

        user = userRepository.save(user);

        // Assign GUEST role by default
        final User savedUser = user;
        roleRepository.findByCode("GUEST").ifPresent(guestRole -> {
            com.apiaura.apiaura.identity.role.entity.UserRole ur = new com.apiaura.apiaura.identity.role.entity.UserRole();
            ur.setUser(savedUser);
            ur.setRole(guestRole);
            ur.setAssignedAt(Instant.now());
            userRoleRepository.save(ur);
            savedUser.getRoles().add(ur);
        });

        // Create pending organization join request if selected during registration
        if (request.getOrganizationId() != null) {
            organizationRepository.findById(request.getOrganizationId()).ifPresent(org -> {
                com.apiaura.apiaura.org.organization.entity.OrganizationMembershipRequest req =
                        new com.apiaura.apiaura.org.organization.entity.OrganizationMembershipRequest();
                req.setUser(savedUser);
                req.setOrganization(org);
                req.setStatus(com.apiaura.apiaura.foundation.common.enums.MembershipRequestStatus.PENDING);
                req.setMessage("Requested joining organization during registration");
                req.setRequestedAt(Instant.now());
                membershipRequestRepository.save(req);
            });
        }

        // Create default workspace ("My Workspace"), collection ("My Collection"), and sample request
        createDefaultWorkspaceForUser(savedUser);

        return createAuthResponse(savedUser);
    }

    private void createDefaultWorkspaceForUser(User user) {
        try {
            // 1. Create Default Workspace
            Workspace workspace = new Workspace();
            workspace.setName("My Workspace");

            String baseSlug = "my-workspace";
            String slug = baseSlug;
            int counter = 1;
            while (workspaceRepository.existsByCreatedByIdAndSlug(user.getId(), slug)) {
                slug = baseSlug + "-" + counter++;
            }
            workspace.setSlug(slug);
            workspace.setDescription("Default personal workspace for " + user.getName());
            workspace.setCreatedBy(user);
            workspace.setStatus(WorkspaceStatus.ACTIVE);

            workspace = workspaceRepository.save(workspace);

            // WorkspaceMember for creator
            WorkspaceMember member = new WorkspaceMember();
            member.setWorkspace(workspace);
            member.setUser(user);
            member.setInvitedBy(user);
            member.setStatus("ACTIVE");
            member.setJoinedAt(Instant.now());
            workspaceMemberRepository.save(member);

            // 2. Create Default Collection
            Collection collection = new Collection();
            collection.setWorkspace(workspace);
            collection.setCreatedBy(user);
            collection.setName("My Collection");
            collection.setDescription("Default collection for API testing");
            collection.setDocumentation("Contains sample API requests to help you get started with ApiAura.");

            collection = collectionRepository.save(collection);

            // 3. Create Default Placeholder ApiRequest
            ApiRequest sampleRequest = new ApiRequest();
            sampleRequest.setCollection(collection);
            sampleRequest.setCreatedBy(user);
            sampleRequest.setName("Sample Request");
            sampleRequest.setMethod(HttpMethod.GET);
            sampleRequest.setUrl("https://jsonplaceholder.typicode.com/todos/1");
            sampleRequest.setDescription("Default GET request to test API execution");
            sampleRequest.setDocumentation("Sends a GET request to JSONPlaceholder sample REST API endpoint.");
            sampleRequest.setBodyType(BodyType.NONE);
            sampleRequest.setEnabled(true);

            apiRequestRepository.save(sampleRequest);
            log.info("Successfully created default workspace 'My Workspace', collection 'My Collection', and sample request for user {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to create default workspace for user {}: {}", user.getEmail(), e.getMessage(), e);
        }
    }

    @Override
    public List<com.apiaura.apiaura.org.organization.dto.response.OrganizationResponse> getPublicOrganizations() {
        return organizationRepository.findAll()
                .stream()
                .map(com.apiaura.apiaura.org.organization.dto.response.OrganizationResponse::from)
                .toList();
    }

    @Override
    public AuthResponse login(@NonNull LoginRequest request) {

        String email = request.getEmail()
                .trim()
                .toLowerCase();

        try {
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                email,
                                request.getPassword()
                        )
                );
        } catch (AuthenticationException e) {
                throw new UnauthorizedException("Invalid email or password. Please enter valid credentials.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UnauthorizedException(
                                "Invalid email or password"
                        )
                );

        user.setLastLoginAt(Instant.now());
        userRepository.save(user);

        return createAuthResponse(user);
    }

    @Override
    @Transactional
    public AuthResponse refresh(
            @NonNull RefreshTokenRequest request
    ) {

        String hash = hash(request.getRefreshToken());

        RefreshToken refreshToken =
                refreshTokenRepository
                        .findByTokenHashAndRevokedAtIsNull(hash)
                        .orElseThrow(() ->
                                new UnauthorizedException(
                                        "Invalid refresh token"
                                )
                        );

        if (refreshToken.getExpiresAt()
                .isBefore(Instant.now())) {

            refreshToken.setRevokedAt(Instant.now());
            refreshTokenRepository.save(refreshToken);

            throw new UnauthorizedException(
                    "Refresh token has expired"
            );
        }

        User user = refreshToken.getUser();

        return createAuthResponse(user);
    }

    @Override
    @Transactional
    public void logout(String refreshToken) {

        String hash = hash(refreshToken);

        refreshTokenRepository
                .findByTokenHash(hash)
                .ifPresent(token -> {

                    token.setRevokedAt(Instant.now());

                    refreshTokenRepository.save(token);
                });
    }

    @Override
    @Transactional
    public void logoutAll(UUID userId) {

        refreshTokenRepository
                .findByUserIdAndRevokedAtIsNull(userId)
                .forEach(token -> {
                    token.setRevokedAt(Instant.now());
                    refreshTokenRepository.save(token);
                });
    }

    private AuthResponse createAuthResponse(
            User user
    ) {

        String accessToken =
                jwtService.generateAccessToken(user.getId());

        String refreshToken =
                generateRefreshToken();

        RefreshToken entity =
                new RefreshToken();

        entity.setUser(user);
        entity.setTokenHash(
                hash(refreshToken)
        );
        entity.setExpiresAt(
                Instant.now().plusMillis(
                        jwtProperties.getRefreshTokenExpiration()
                )
        );

        refreshTokenRepository.save(entity);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(
                        jwtProperties.getAccessTokenExpiration()
                                / 1000
                )
                .user(UserResponse.from(user))
                .build();
    }

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private String generateRefreshToken() {

        byte[] randomBytes = new byte[32];
        SECURE_RANDOM.nextBytes(randomBytes);

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(randomBytes);
    }

    private String hash(String value) {

        try {

            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            byte[] hash =
                    digest.digest(
                            value.getBytes(StandardCharsets.UTF_8)
                    );

            return Base64.getEncoder()
                    .encodeToString(hash);

        } catch (NoSuchAlgorithmException exception) {

            throw new IllegalStateException(
                    "SHA-256 algorithm unavailable",
                    exception
            );
        }
    }
}
