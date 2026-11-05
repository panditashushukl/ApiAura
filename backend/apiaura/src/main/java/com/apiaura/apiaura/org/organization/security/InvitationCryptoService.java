package com.apiaura.apiaura.org.organization.security;

import com.apiaura.apiaura.foundation.common.exception.BadRequestException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;

@Slf4j
@Service
public class InvitationCryptoService {

    private static final String AES_ALGORITHM = "AES";
    private static final String CIPHER_TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH_BYTES = 12;
    private static final int GCM_TAG_LENGTH_BITS = 128;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final ObjectMapper objectMapper;
    private final SecretKey secretKey;

    public InvitationCryptoService(
            @org.springframework.beans.factory.annotation.Autowired(required = false) ObjectMapper objectMapper,
            @Value("${security.jwt.secret}") String jwtSecret
    ) {
        this.objectMapper = objectMapper != null ? objectMapper : new ObjectMapper();
        this.secretKey = deriveKey(jwtSecret);
    }

    /**
     * Encrypts the invitation payload using AES-256-GCM.
     * Output format: Base64UrlSafe( 12-byte IV + CiphertextAndTag )
     */
    public String encrypt(InvitationTokenPayload payload) {
        try {
            byte[] iv = new byte[GCM_IV_LENGTH_BYTES];
            SECURE_RANDOM.nextBytes(iv);

            byte[] plaintext = objectMapper.writeValueAsBytes(payload);

            Cipher cipher = Cipher.getInstance(CIPHER_TRANSFORMATION);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, parameterSpec);

            byte[] cipherTextWithTag = cipher.doFinal(plaintext);

            // Combine IV + ciphertextWithTag
            byte[] combined = new byte[iv.length + cipherTextWithTag.length];
            System.arraycopy(iv, 0, combined, 0, iv.length);
            System.arraycopy(cipherTextWithTag, 0, combined, iv.length, cipherTextWithTag.length);

            return Base64.getUrlEncoder().withoutPadding().encodeToString(combined);
        } catch (Exception ex) {
            log.error("Failed to encrypt invitation token: {}", ex.getMessage(), ex);
            throw new IllegalStateException("Failed to generate secure invitation token", ex);
        }
    }

    /**
     * Decrypts and validates the encrypted invitation token.
     * Verifies ciphertext integrity (tamper-proofing) and expiration.
     */
    public InvitationTokenPayload decrypt(String token) {
        if (token == null || token.isBlank()) {
            throw new BadRequestException("Invitation token is required");
        }

        try {
            byte[] combined = Base64.getUrlDecoder().decode(token.trim());
            if (combined.length <= GCM_IV_LENGTH_BYTES) {
                throw new BadRequestException("Invalid invitation token format");
            }

            byte[] iv = new byte[GCM_IV_LENGTH_BYTES];
            System.arraycopy(combined, 0, iv, 0, GCM_IV_LENGTH_BYTES);

            int cipherTextLength = combined.length - GCM_IV_LENGTH_BYTES;
            byte[] cipherTextWithTag = new byte[cipherTextLength];
            System.arraycopy(combined, GCM_IV_LENGTH_BYTES, cipherTextWithTag, 0, cipherTextLength);

            Cipher cipher = Cipher.getInstance(CIPHER_TRANSFORMATION);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, parameterSpec);

            byte[] plaintext = cipher.doFinal(cipherTextWithTag);
            InvitationTokenPayload payload = objectMapper.readValue(plaintext, InvitationTokenPayload.class);

            if (payload == null || payload.getInvitationId() == null || payload.getOrganizationId() == null) {
                throw new BadRequestException("Malformed invitation token payload");
            }

            if (payload.getExpiresAtEpochMs() > 0 &&
                    Instant.ofEpochMilli(payload.getExpiresAtEpochMs()).isBefore(Instant.now())) {
                throw new BadRequestException("Invitation token has expired");
            }

            return payload;
        } catch (BadRequestException ex) {
            throw ex;
        } catch (Exception ex) {
            log.warn("Decryption failed for invitation token: {}", ex.getMessage());
            throw new BadRequestException("Invalid or tampered invitation credentials");
        }
    }

    /**
     * Computes SHA-256 hash in lowercase hex for fast indexed lookup in DB.
     */
    public String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.trim().getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 algorithm not available", ex);
        }
    }

    private SecretKey deriveKey(String secret) {
        try {
            MessageDigest sha256 = MessageDigest.getInstance("SHA-256");
            byte[] keyBytes = sha256.digest(secret.getBytes(StandardCharsets.UTF_8));
            return new SecretKeySpec(keyBytes, AES_ALGORITHM);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 algorithm not available", ex);
        }
    }
}
