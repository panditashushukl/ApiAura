package com.apiaura.apiaura.identity.auth.service;

import com.apiaura.apiaura.foundation.common.exception.BadRequestException;
import com.apiaura.apiaura.foundation.email.EmailService;
import com.apiaura.apiaura.identity.auth.dto.request.ForgotPasswordRequest;
import com.apiaura.apiaura.identity.auth.dto.request.ResetPasswordRequest;
import com.apiaura.apiaura.identity.auth.entity.PasswordResetToken;
import com.apiaura.apiaura.identity.auth.repository.PasswordResetTokenRepository;
import com.apiaura.apiaura.identity.auth.repository.RefreshTokenRepository;
import com.apiaura.apiaura.identity.user.entity.User;
import com.apiaura.apiaura.identity.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthPasswordResetTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private AuthServiceImpl authService;

    private User testUser;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authService, "frontendBaseUrl", "http://localhost:4200");

        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setName("John Doe");
        testUser.setEmail("john@example.com");
        testUser.setPasswordHash("oldHash");
    }

    @Test
    @DisplayName("Should silently succeed when email does not exist")
    void testForgotPasswordUserNotFound() {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("unknown@example.com");

        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        authService.forgotPassword(request);

        verify(passwordResetTokenRepository, never()).save(any());
        verify(emailService, never()).sendPasswordResetEmail(any(), any(), any(), any());
    }

    @Test
    @DisplayName("Should generate token and dispatch email when user exists")
    void testForgotPasswordSuccess() {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("john@example.com");

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(testUser));
        when(passwordResetTokenRepository.findAllByUserAndUsedAtIsNull(testUser)).thenReturn(Collections.emptyList());

        authService.forgotPassword(request);

        ArgumentCaptor<PasswordResetToken> tokenCaptor = ArgumentCaptor.forClass(PasswordResetToken.class);
        verify(passwordResetTokenRepository).save(tokenCaptor.capture());

        PasswordResetToken savedToken = tokenCaptor.getValue();
        assertThat(savedToken.getUser()).isEqualTo(testUser);
        assertThat(savedToken.getTokenHash()).isNotBlank();
        assertThat(savedToken.getExpiresAt()).isAfter(Instant.now());

        verify(emailService).sendPasswordResetEmail(
                eq("john@example.com"),
                eq("John Doe"),
                startsWith("http://localhost:4200/reset-password?token="),
                any()
        );
    }

    @Test
    @DisplayName("Should reset password and invalidate sessions for valid token")
    void testResetPasswordSuccess() {
        String rawToken = "sample-secure-token-123";
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken(rawToken);
        request.setNewPassword("newSecretPassword456");

        PasswordResetToken token = PasswordResetToken.builder()
                .id(UUID.randomUUID())
                .user(testUser)
                .tokenHash("someHash")
                .expiresAt(Instant.now().plus(1, ChronoUnit.HOURS))
                .build();

        when(passwordResetTokenRepository.findByTokenHash(any())).thenReturn(Optional.of(token));
        when(passwordEncoder.encode("newSecretPassword456")).thenReturn("encodedNewHash");

        authService.resetPassword(request);

        assertThat(testUser.getPasswordHash()).isEqualTo("encodedNewHash");
        assertThat(token.isUsed()).isTrue();
        verify(userRepository).save(testUser);
        verify(passwordResetTokenRepository).save(token);
        verify(refreshTokenRepository).deleteByUserId(testUser.getId());
    }

    @Test
    @DisplayName("Should fail reset password if token has expired")
    void testResetPasswordExpiredToken() {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("expired-token");
        request.setNewPassword("newPass123");

        PasswordResetToken token = PasswordResetToken.builder()
                .id(UUID.randomUUID())
                .user(testUser)
                .tokenHash("someHash")
                .expiresAt(Instant.now().minus(1, ChronoUnit.MINUTES))
                .build();

        when(passwordResetTokenRepository.findByTokenHash(any())).thenReturn(Optional.of(token));

        assertThatThrownBy(() -> authService.resetPassword(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("expired");
    }
}

