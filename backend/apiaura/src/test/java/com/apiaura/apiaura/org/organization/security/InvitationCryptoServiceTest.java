package com.apiaura.apiaura.org.organization.security;

import com.apiaura.apiaura.foundation.common.exception.BadRequestException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class InvitationCryptoServiceTest {

    private InvitationCryptoService cryptoService;

    @BeforeEach
    void setUp() {
        cryptoService = new InvitationCryptoService(
                new ObjectMapper(),
                "super-secure-production-jwt-secret-key-32-chars-long"
        );
    }

    @Test
    @DisplayName("Should successfully encrypt and decrypt valid invitation payload")
    void testEncryptAndDecryptSuccess() {
        UUID inviteId = UUID.randomUUID();
        UUID orgId = UUID.randomUUID();
        UUID roleId = UUID.randomUUID();
        String email = "dev@example.com";
        String roleCode = "DEVELOPER";
        long exp = Instant.now().plus(7, ChronoUnit.DAYS).toEpochMilli();

        InvitationTokenPayload payload = InvitationTokenPayload.builder()
                .invitationId(inviteId)
                .organizationId(orgId)
                .email(email)
                .roleId(roleId)
                .roleCode(roleCode)
                .expiresAtEpochMs(exp)
                .build();

        String token = cryptoService.encrypt(payload);
        assertThat(token).isNotBlank();

        InvitationTokenPayload decrypted = cryptoService.decrypt(token);
        assertThat(decrypted).isNotNull();
        assertThat(decrypted.getInvitationId()).isEqualTo(inviteId);
        assertThat(decrypted.getOrganizationId()).isEqualTo(orgId);
        assertThat(decrypted.getEmail()).isEqualTo(email);
        assertThat(decrypted.getRoleId()).isEqualTo(roleId);
        assertThat(decrypted.getRoleCode()).isEqualTo(roleCode);
        assertThat(decrypted.getExpiresAtEpochMs()).isEqualTo(exp);
    }

    @Test
    @DisplayName("Should throw BadRequestException if token has expired")
    void testExpiredTokenThrows() {
        InvitationTokenPayload payload = InvitationTokenPayload.builder()
                .invitationId(UUID.randomUUID())
                .organizationId(UUID.randomUUID())
                .email("expired@example.com")
                .roleCode("GUEST")
                .expiresAtEpochMs(Instant.now().minus(1, ChronoUnit.HOURS).toEpochMilli())
                .build();

        String token = cryptoService.encrypt(payload);

        assertThatThrownBy(() -> cryptoService.decrypt(token))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("expired");
    }

    @Test
    @DisplayName("Should throw BadRequestException if token is tampered with")
    void testTamperedTokenThrows() {
        InvitationTokenPayload payload = InvitationTokenPayload.builder()
                .invitationId(UUID.randomUUID())
                .organizationId(UUID.randomUUID())
                .email("test@example.com")
                .roleCode("ADMIN")
                .expiresAtEpochMs(Instant.now().plus(1, ChronoUnit.HOURS).toEpochMilli())
                .build();

        String token = cryptoService.encrypt(payload);
        byte[] bytes = Base64.getUrlDecoder().decode(token);
        // Tamper with one byte in the ciphertext
        bytes[bytes.length - 1] ^= 0x5A;
        String tamperedToken = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

        assertThatThrownBy(() -> cryptoService.decrypt(tamperedToken))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("tampered");
    }

    @Test
    @DisplayName("Should compute consistent SHA-256 hash for token lookups")
    void testHashToken() {
        String token = "sample-token-123";
        String hash1 = cryptoService.hashToken(token);
        String hash2 = cryptoService.hashToken(token);

        assertThat(hash1).isNotNull().hasSize(64);
        assertThat(hash1).isEqualTo(hash2);
    }
}

