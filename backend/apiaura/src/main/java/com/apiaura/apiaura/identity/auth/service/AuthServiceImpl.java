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
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {

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
        user.setPasswordHash(
                passwordEncoder.encode(request.getPassword())
        );

        /*
         * For a real production system this can initially be
         * PENDING until email verification.
         */
        user.setStatus(UserStatus.ACTIVE);

        user = userRepository.save(user);

        return createAuthResponse(user);
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        String email = request.getEmail()
                .trim()
                .toLowerCase();

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        email,
                        request.getPassword()
                )
        );

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
            RefreshTokenRequest request
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

    private String generateRefreshToken() {

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(
                        UUID.randomUUID()
                                .toString()
                                .getBytes(StandardCharsets.UTF_8)
                );
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
